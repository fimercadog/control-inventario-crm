<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StorePrescriptionRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'consultation_id' => ['required', 'integer', $inCompany('consultations')],
            'vet_id' => ['nullable', 'integer', $inCompany('users')],
            'notes' => ['nullable', 'string', 'max:3000'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['nullable', 'integer', $inCompany('products')],
            'items.*.medication_name' => ['required', 'string', 'max:200'],
            'items.*.dosage' => ['nullable', 'string', 'max:120'],
            'items.*.frequency' => ['nullable', 'string', 'max:120'],
            'items.*.duration' => ['nullable', 'string', 'max:120'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('vet_id') && $this->user()) {
            $this->merge(['vet_id' => $this->user()->id]);
        }
    }
}
