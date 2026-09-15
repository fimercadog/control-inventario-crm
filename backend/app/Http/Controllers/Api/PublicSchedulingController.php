<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicAppointmentBookingRequest;
use App\Http\Resources\PublicServiceResource;
use App\Models\Appointment;
use App\Models\Breed;
use App\Models\Client;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Species;
use App\Models\User;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Portal publico "Agendar cita" (S13): disponibilidad real + cita
 * auto-confirmada. Complementa (no reemplaza) `PublicAppointmentController`,
 * que sigue generando un Lead para quien prefiere "solicitá y te llamamos".
 * Sin auth (throttle en las rutas).
 */
class PublicSchedulingController extends Controller
{
    use ResolvesCompany;

    public function services(Request $request)
    {
        $services = Service::query()
            ->where('company_id', $this->companyId($request))
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return PublicServiceResource::collection($services);
    }

    public function species(Request $request)
    {
        return Species::query()
            ->where('company_id', $this->companyId($request))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function breeds(Request $request, int $speciesId)
    {
        return Breed::query()
            ->where('company_id', $this->companyId($request))
            ->where('species_id', $speciesId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function availability(Request $request)
    {
        $companyId = $this->companyId($request);
        $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $service = Service::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->find($request->integer('service_id'));

        abort_unless($service !== null, 422, 'El servicio seleccionado no está disponible.');

        $date = Carbon::createFromFormat('Y-m-d', (string) $request->string('date'))->startOfDay();

        return response()->json([
            'date' => $date->toDateString(),
            'slots' => $this->freeSlots($companyId, $service, $date),
        ]);
    }

    public function book(StorePublicAppointmentBookingRequest $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validated();

        // Honeypot: descarte silencioso, sin dar señal al bot.
        if (! empty($data['company_website'])) {
            return response()->json(['message' => 'Tu cita fue agendada.'], 201);
        }

        $service = Service::query()->where('company_id', $companyId)->where('status', 'active')->find($data['service_id']);
        abort_unless($service !== null, 422, 'El servicio seleccionado ya no está disponible.');

        $species = Species::query()->where('company_id', $companyId)->where('status', 'active')->find($data['species_id']);
        abort_unless($species !== null, 422, 'La especie seleccionada no es válida.');

        $breed = null;
        if (! empty($data['breed_id'])) {
            $breed = Breed::query()->where('company_id', $companyId)->where('species_id', $species->id)->find($data['breed_id']);
            abort_unless($breed !== null, 422, 'La raza seleccionada no es válida.');
        }

        $config = config('scheduling');
        $duration = $service->estimated_duration_minutes ?: $config['default_duration_minutes'];
        $startsAt = Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['start_time']);
        $endsAt = $startsAt->copy()->addMinutes($duration);

        abort_if(
            $startsAt->lt(Carbon::now()->addMinutes($config['min_notice_minutes'])),
            422,
            'Ese horario ya no tiene la anticipación mínima requerida. Elegí otro.',
        );
        abort_unless(in_array($startsAt->isoWeekday(), $config['business_days'], true), 422, 'La clínica no atiende ese día.');
        $dayStart = $startsAt->copy()->setTimeFromTimeString($config['business_hours']['start']);
        $dayEnd = $startsAt->copy()->setTimeFromTimeString($config['business_hours']['end']);
        abort_unless($startsAt->gte($dayStart) && $endsAt->lte($dayEnd), 422, 'Ese horario está fuera del horario de atención.');

        // Cliente: get-or-create FUERA de la transacción de la cita (mismo
        // motivo que PublicCatalogController::storeQuoteRequest: la relectura
        // de firstOrCreate quedaría atrapada en el snapshot REPEATABLE READ de
        // MySQL/MariaDB si corriera dentro).
        $client = Client::firstOrCreate(
            ['company_id' => $companyId, 'email' => $data['email']],
            ['name' => $data['name'], 'phone' => $data['phone'] ?? null, 'status' => 'inactive'],
        );

        $appointment = DB::transaction(function () use ($companyId, $client, $service, $species, $breed, $data, $startsAt, $endsAt, $duration) {
            $patient = Patient::firstOrCreate(
                ['company_id' => $companyId, 'client_id' => $client->id, 'name' => $data['pet_name']],
                ['species_id' => $species->id, 'breed_id' => $breed?->id, 'status' => 'active'],
            );

            $practitioner = $this->firstFreePractitioner($companyId, $startsAt, $endsAt);
            // 409, no 500: dos visitantes pudieron elegir el mismo horario a
            // la vez: el `lockForUpdate` de firstFreePractitioner evita que
            // ambos reserven el mismo veterinario, pero el segundo en llegar
            // tiene que reintentar con otro horario, no romper.
            abort_if($practitioner === null, 409, 'Ese horario ya no está disponible. Elegí otro.');

            $appointment = Appointment::create([
                'company_id' => $companyId,
                'patient_id' => $patient->id,
                'service_id' => $service->id,
                'practitioner_id' => $practitioner->id,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'duration_minutes' => $duration,
                'reason' => $service->name,
                'status' => 'confirmed',
                'notes' => 'Agendada desde el portal público. Contacto: '.$data['name'].
                    (! empty($data['phone']) ? ' · Tel: '.$data['phone'] : ''),
            ]);

            return $appointment;
        });

        $audit->record('created', $appointment, $request);

        return response()->json([
            'message' => 'Tu cita fue agendada.',
            'appointment' => [
                'starts_at' => $appointment->starts_at->toIso8601String(),
                'ends_at' => $appointment->ends_at->toIso8601String(),
                'service' => $service->name,
                'practitioner' => $appointment->practitioner?->name,
            ],
        ], 201);
    }

    /** @return list<string> horarios "H:i" con al menos un veterinario libre */
    private function freeSlots(int $companyId, Service $service, Carbon $date): array
    {
        $config = config('scheduling');
        $today = Carbon::today();

        if ($date->lt($today) || $date->gt($today->copy()->addDays($config['max_days_ahead']))) {
            return [];
        }
        if (! in_array($date->isoWeekday(), $config['business_days'], true)) {
            return [];
        }

        $practitioners = $this->practitioners($companyId);
        if ($practitioners->isEmpty()) {
            return [];
        }

        $duration = $service->estimated_duration_minutes ?: $config['default_duration_minutes'];
        $dayStart = $date->copy()->setTimeFromTimeString($config['business_hours']['start']);
        $dayEnd = $date->copy()->setTimeFromTimeString($config['business_hours']['end']);
        $earliestAllowed = Carbon::now()->addMinutes($config['min_notice_minutes']);

        $busy = Appointment::query()
            ->where('company_id', $companyId)
            ->whereIn('practitioner_id', $practitioners->pluck('id'))
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->whereDate('starts_at', $date->toDateString())
            ->get(['practitioner_id', 'starts_at', 'ends_at']);

        $slots = [];
        for ($slotStart = $dayStart->copy(); $slotStart->copy()->addMinutes($duration)->lte($dayEnd); $slotStart->addMinutes($config['slot_step_minutes'])) {
            if ($slotStart->lt($earliestAllowed)) {
                continue;
            }
            $slotEnd = $slotStart->copy()->addMinutes($duration);

            $hasFreePractitioner = $practitioners->contains(fn ($practitioner) => ! $busy->contains(
                fn ($appt) => $appt->practitioner_id === $practitioner->id
                    && $appt->starts_at->lt($slotEnd) && $appt->ends_at->gt($slotStart)
            ));

            if ($hasFreePractitioner) {
                $slots[] = $slotStart->format('H:i');
            }
        }

        return $slots;
    }

    /** @return Collection<int, User> veterinarios activos de la empresa */
    private function practitioners(int $companyId): Collection
    {
        return User::query()
            ->where('company_id', $companyId)
            ->role('Veterinario/a')
            ->get(['id', 'name']);
    }

    /**
     * Bajo lock, primer veterinario sin choque de horario. Usado solo dentro
     * de la transacción de `book()`: el `lockForUpdate` sobre el índice
     * (company_id, practitioner_id, starts_at) hace que una segunda reserva
     * concurrente del mismo veterinario/horario espere hasta que la primera
     * confirme (o libere el hueco al fallar).
     */
    private function firstFreePractitioner(int $companyId, Carbon $startsAt, Carbon $endsAt): ?User
    {
        foreach ($this->practitioners($companyId) as $practitioner) {
            $busy = Appointment::query()
                ->where('company_id', $companyId)
                ->where('practitioner_id', $practitioner->id)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->where('starts_at', '<', $endsAt)
                ->where('ends_at', '>', $startsAt)
                ->lockForUpdate()
                ->exists();

            if (! $busy) {
                return $practitioner;
            }
        }

        return null;
    }
}
