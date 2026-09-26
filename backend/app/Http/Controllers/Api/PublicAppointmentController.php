<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicAppointmentRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

/**
 * Portal público "Solicitud de clase de prueba / Inscripción". Genera un Lead con
 * `source=appointment` para que la coordinación deportiva revise la categoría y contacte al acudiente.
 */
class PublicAppointmentController extends Controller
{
    use ResolvesCompany;

    public function store(StorePublicAppointmentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $ok = response()->json([
            'message' => 'Recibimos tu solicitud. La Escuela de Fútbol confirmará disponibilidad y te contactará para agendar la clase de prueba.',
        ]);

        // Honeypot: descarte silencioso.
        if (! empty($data['company_website'])) {
            return $ok;
        }

        $studentName = $data['student_name'] ?? $data['pet_name'] ?? null;

        $message = collect([
            $data['message'] ?? null,
            ! empty($studentName) ? 'Alumno/Aspirante: '.$studentName : null,
            ! empty($data['reason']) ? 'Categoría / Motivo: '.$data['reason'] : null,
            ! empty($data['preferred_date']) ? 'Fecha preferida: '.$data['preferred_date'] : null,
        ])->filter()->implode(' — ');

        $companyId = $this->companyId($request);

        $duplicate = Lead::query()
            ->where('company_id', $companyId)
            ->where('email', $data['email'])
            ->where('source', 'appointment')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if (! $duplicate) {
            Lead::create([
                'company_id' => $companyId,
                'email' => $data['email'],
                'source' => 'appointment',
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'message' => $message ?: null,
                'status' => 'new',
                'ip_address' => $request->ip(),
            ]);
        }

        return $ok;
    }
}
