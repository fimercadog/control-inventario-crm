<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * Motor de disponibilidad de citas (S13). Compartido por el booking público
 * (PublicSchedulingController) y el reagendado del portal del dueño
 * (PortalAppointmentController) para no duplicar la lógica de choque de
 * horarios -- en particular el locking de `firstFreePractitioner`, que es
 * donde vive la protección anti-doble-booking.
 */
class SchedulingService
{
    /**
     * Aborta 422 si `[startsAt, endsAt)` no cae dentro de un día hábil y del
     * horario de atención, o no cumple la anticipación mínima. Compartido por
     * el booking público y el reagendado del portal para no repetir las
     * mismas tres validaciones en cada lugar.
     */
    public function assertWithinBusinessWindow(Carbon $startsAt, Carbon $endsAt): void
    {
        $config = config('scheduling');

        abort_if(
            $startsAt->lt(Carbon::now()->addMinutes($config['min_notice_minutes'])),
            422,
            'Ese horario ya no tiene la anticipación mínima requerida. Elegí otro.',
        );
        abort_unless(in_array($startsAt->isoWeekday(), $config['business_days'], true), 422, 'La clínica no atiende ese día.');

        $dayStart = $startsAt->copy()->setTimeFromTimeString($config['business_hours']['start']);
        $dayEnd = $startsAt->copy()->setTimeFromTimeString($config['business_hours']['end']);
        abort_unless($startsAt->gte($dayStart) && $endsAt->lte($dayEnd), 422, 'Ese horario está fuera del horario de atención.');
    }

    /** @return list<string> horarios "H:i" con al menos un veterinario libre */
    public function freeSlots(int $companyId, Service $service, Carbon $date, ?int $excludeAppointmentId = null): array
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
            ->when($excludeAppointmentId, fn ($q) => $q->where('id', '!=', $excludeAppointmentId))
            ->get(['id', 'practitioner_id', 'starts_at', 'ends_at']);

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

    /** @return Collection<int, User> médicos y profesionales activos de la empresa */
    public function practitioners(int $companyId): Collection
    {
        return User::query()
            ->where('company_id', $companyId)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['Veterinario/a', 'Médico/a', 'Médico Tratante', 'Doctor/a', 'Especialista', 'Médico']))
            ->get(['id', 'name']);
    }

    /**
     * Bajo lock, primer veterinario sin choque de horario. Llamar SOLO dentro
     * de una `DB::transaction`: el `lockForUpdate` sobre el índice
     * (company_id, practitioner_id, starts_at) hace que una segunda reserva
     * concurrente del mismo veterinario/horario espere hasta que la primera
     * confirme (o libere el hueco al fallar). `$excludeAppointmentId` es para
     * reagendar: la cita que se está moviendo no debe chocar consigo misma.
     */
    public function firstFreePractitioner(int $companyId, Carbon $startsAt, Carbon $endsAt, ?int $excludeAppointmentId = null): ?User
    {
        foreach ($this->practitioners($companyId) as $practitioner) {
            $busy = Appointment::query()
                ->where('company_id', $companyId)
                ->where('practitioner_id', $practitioner->id)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->where('starts_at', '<', $endsAt)
                ->where('ends_at', '>', $startsAt)
                ->when($excludeAppointmentId, fn ($q) => $q->where('id', '!=', $excludeAppointmentId))
                ->lockForUpdate()
                ->exists();

            if (! $busy) {
                return $practitioner;
            }
        }

        return null;
    }
}
