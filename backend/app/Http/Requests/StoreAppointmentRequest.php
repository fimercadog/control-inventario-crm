<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'patient_id' => ['required', 'integer', $inCompany('patients')],
            'service_id' => ['nullable', 'integer', $inCompany('services')],
            'practitioner_id' => ['nullable', 'integer', $inCompany('users')],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'resource' => ['nullable', 'string', 'max:80'],
            'reason' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(Appointment::STATUSES)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('duration_minutes')) {
            return;
        }

        $minutes = null;
        if ($this->filled('service_id')) {
            $minutes = Service::query()
                ->where('company_id', $this->user()?->company_id)
                ->where('id', $this->input('service_id'))
                ->value('estimated_duration_minutes');
        }

        if (! $minutes && $this->filled(['starts_at', 'ends_at'])) {
            $minutes = max(1, (int) round(
                (strtotime((string) $this->input('ends_at')) - strtotime((string) $this->input('starts_at'))) / 60
            ));
        }

        $this->merge(['duration_minutes' => $minutes ?: 30]);
    }
}
