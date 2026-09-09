<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreProcedureRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'patient_id' => ['required', 'integer', $inCompany('patients')],
            'service_id' => ['nullable', 'integer', $inCompany('services')],
            'vet_id' => ['nullable', 'integer', $inCompany('users')],
            'type' => ['required', 'string', 'max:150'],
            'performed_at' => ['required', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (! $this->filled('performed_at')) {
            $merge['performed_at'] = now()->toDateString();
        }
        if (! $this->filled('vet_id') && $this->user()) {
            $merge['vet_id'] = $this->user()->id;
        }
        if ($merge) {
            $this->merge($merge);
        }
    }
}
