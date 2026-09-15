<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReschedulePortalAppointmentRequest;
use App\Http\Resources\PortalAppointmentResource;
use App\Models\Appointment;
use App\Models\Client;
use App\Services\AuditService;
use App\Services\SchedulingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * CRUD del dueño sobre sus propias citas (S14, guard `client`). "Crear" se
 * hace desde el portal público /agendar-cita (mismo email = mismo Client, ver
 * PublicSchedulingController::book) -- acá solo lee, reagenda y cancela.
 */
class PortalAppointmentController extends Controller
{
    public function __construct(private readonly SchedulingService $scheduling) {}

    public function index(Request $request)
    {
        $client = $this->client($request);

        $appointments = Appointment::query()
            ->where('company_id', $client->company_id)
            ->whereHas('patient', fn ($q) => $q->where('client_id', $client->id))
            ->with(['patient', 'service', 'practitioner'])
            ->orderBy('starts_at', 'desc')
            ->get();

        return PortalAppointmentResource::collection($appointments);
    }

    public function reschedule(ReschedulePortalAppointmentRequest $request, string $id, AuditService $audit)
    {
        $client = $this->client($request);
        $appointment = $this->ownAppointment($client, $id);

        abort_unless(in_array($appointment->status, ['scheduled', 'confirmed'], true), 422, 'Esta cita ya no se puede reagendar.');

        $data = $request->validated();
        $startsAt = Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['start_time']);
        $endsAt = $startsAt->copy()->addMinutes($appointment->duration_minutes);
        $this->scheduling->assertWithinBusinessWindow($startsAt, $endsAt);

        $old = $appointment->getOriginal();

        $appointment = DB::transaction(function () use ($appointment, $client, $startsAt, $endsAt) {
            $practitioner = $this->scheduling->firstFreePractitioner(
                $client->company_id,
                $startsAt,
                $endsAt,
                excludeAppointmentId: $appointment->id,
            );
            abort_if($practitioner === null, 409, 'Ese horario ya no está disponible. Elegí otro.');

            $appointment->update(['starts_at' => $startsAt, 'ends_at' => $endsAt, 'practitioner_id' => $practitioner->id]);

            return $appointment;
        });

        $audit->record('updated', $appointment, $request, $old);

        return new PortalAppointmentResource($appointment->load(['patient', 'service', 'practitioner']));
    }

    public function cancel(Request $request, string $id, AuditService $audit)
    {
        $client = $this->client($request);
        $appointment = $this->ownAppointment($client, $id);

        abort_unless(in_array($appointment->status, ['scheduled', 'confirmed'], true), 422, 'Esta cita ya no se puede cancelar.');

        $old = $appointment->getOriginal();
        $appointment->update(['status' => 'cancelled']);
        $audit->record('updated', $appointment, $request, $old);

        return new PortalAppointmentResource($appointment->load(['patient', 'service', 'practitioner']));
    }

    private function client(Request $request): Client
    {
        /** @var Client $client */
        $client = $request->user('client');

        return $client;
    }

    private function ownAppointment(Client $client, string $id): Appointment
    {
        return Appointment::query()
            ->where('company_id', $client->company_id)
            ->whereHas('patient', fn ($q) => $q->where('client_id', $client->id))
            ->findOrFail($id);
    }
}
