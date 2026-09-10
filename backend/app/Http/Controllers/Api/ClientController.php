<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ActivityResource;
use App\Http\Resources\ClientNoteResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\DealResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PatientResource;
use App\Http\Resources\QuoteResource;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\Order;
use App\Models\Quote;
use Illuminate\Http\Request;

class ClientController extends BaseCrudController
{
    protected string $model = Client::class;

    protected string $resource = ClientResource::class;

    protected array $with = ['segment'];

    protected array $searchable = ['name', 'company_name', 'email'];

    protected array $filterable = ['status' => 'status', 'segment_id' => 'segment_id'];

    /** Vista agregada: todo lo que ha pasado con un cliente. */
    public function history(Request $request, Client $client)
    {
        abort_unless($client->company_id === $this->companyId($request), 404);

        // Las mascotas del cliente son datos clínicos: solo para quien tiene
        // patients.manage (Recepción / Veterinario). Ventas ve el cliente pero
        // no su historia clínica, aunque llegue por esta ruta agregada.
        $canSeePatients = $request->user()?->can('patients.manage') ?? false;

        return response()->json([
            'client' => new ClientResource($client->load('segment')),
            'patients' => $canSeePatients ? PatientResource::collection(
                $client->patients()->with(['species', 'breed'])->latest()->limit(50)->get()
            ) : [],
            'deals' => DealResource::collection($client->deals()->latest()->limit(50)->get()),
            'activities' => ActivityResource::collection(
                $client->activities()->with('deal')->orderByRaw('COALESCE(due_date, created_at) desc')->limit(50)->get()
            ),
            'orders' => OrderResource::collection(
                Order::where('client_id', $client->id)->with('warehouse')->latest()->limit(50)->get()
            ),
            'quotes' => QuoteResource::collection(
                Quote::where('client_id', $client->id)->latest()->limit(50)->get()
            ),
            'notes' => ClientNoteResource::collection(
                ClientNote::where('client_id', $client->id)->with('author')->latest()->limit(50)->get()
            ),
        ]);
    }
}
