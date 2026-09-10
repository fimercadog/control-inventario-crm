<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreConsultationRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'patient_id' => ['required', 'integer', $inCompany('patients')->whereNull('deleted_at')],
            'appointment_id' => ['nullable', 'integer', $inCompany('appointments')],
            'vet_id' => ['nullable', 'integer', $inCompany('users')],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'temperature' => ['nullable', 'numeric', 'min:20', 'max:50'],
            'subjective' => ['nullable', 'string', 'max:5000'],
            'objective' => ['nullable', 'string', 'max:5000'],
            'assessment' => ['nullable', 'string', 'max:5000'],
            'plan' => ['nullable', 'string', 'max:5000'],
            'diagnosis_ids' => ['nullable', 'array'],
            'diagnosis_ids.*' => ['integer', Rule::exists('diagnoses', 'id')->where('company_id', $companyId)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (! $this->filled('date')) {
            $merge['date'] = now()->toDateString();
        }
        if (! $this->filled('vet_id') && $this->user()) {
            $merge['vet_id'] = $this->user()->id;
        }
        if ($merge) {
            $this->merge($merge);
        }
    }
}
