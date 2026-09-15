<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePortalLoginRequest;
use App\Models\Client;
use App\Notifications\ClientMagicLinkNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;

/**
 * Portal del dueño (S14): login sin password, por enlace mágico firmado
 * (`URL::temporarySignedRoute`, sin tabla de tokens propia). Guard `client`
 * separado del panel de staff (`config/auth.php`).
 */
class PortalAuthController extends Controller
{
    use ResolvesCompany;

    public function requestLink(StorePortalLoginRequest $request)
    {
        $data = $request->validated();
        $ok = response()->json([
            'message' => 'Si el correo está registrado, te enviamos un enlace de acceso.',
        ]);

        // Honeypot: descarte silencioso.
        if (! empty($data['company_website'])) {
            return $ok;
        }

        $client = Client::query()
            ->where('company_id', $this->companyId($request))
            ->where('email', $data['email'])
            ->first();

        // Misma respuesta exista o no la cuenta: no filtrar qué correos son
        // reales (enumeración de dueños registrados).
        if ($client !== null) {
            $url = URL::temporarySignedRoute('portal.consume', now()->addMinutes(15), ['client' => $client->id]);
            $client->notify(new ClientMagicLinkNotification($url));
        }

        return $ok;
    }

    /**
     * El link del correo apunta al frontend (`/portal/entrar?url=...`), que
     * llama a este endpoint por `fetch`/axios con `withCredentials`, no por
     * navegación directa: así el request sí llega con el header `Origin` que
     * `EnsureFrontendRequestsAreStateful` necesita para tratarlo como
     * "stateful" y setear la cookie de sesión (una navegación de nivel
     * superior desde el cliente de correo no manda ese header).
     */
    public function consume(Request $request, Client $client)
    {
        abort_unless($client->company_id === $this->companyId($request), 403);

        Auth::guard('client')->login($client);
        $request->session()->regenerate();

        return response()->json(['message' => 'Sesión iniciada.']);
    }

    public function me(Request $request)
    {
        $client = $request->user('client');

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('client')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
