<?php

namespace App\Http\Requests;

use App\Models\ClinicalApplication;
use Illuminate\Validation\Rule;

class StoreClinicalApplicationRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'type' => ['required', Rule::in(ClinicalApplication::TYPES)],
            'patient_id' => ['required', 'integer', $inCompany('patients')],
            'product_id' => ['nullable', 'integer', $inCompany('products')],
            'consultation_id' => ['nullable', 'integer', $inCompany('consultations')],
            'warehouse_id' => ['nullable', 'integer', 'required_with:product_id', $inCompany('warehouses')],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'vet_id' => ['nullable', 'integer', $inCompany('users')],
            'name' => ['required', 'string', 'max:150'],
            'applied_at' => ['required', 'date', 'before_or_equal:today'],
            'lot' => ['nullable', 'string', 'max:60'],
            'expires_at' => ['nullable', 'date'],
            'next_due_at' => ['nullable', 'date', 'after:applied_at'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (! $this->filled('applied_at')) {
            $merge['applied_at'] = now()->toDateString();
        }
        if (! $this->filled('vet_id') && $this->user()) {
            $merge['vet_id'] = $this->user()->id;
        }
        if (! $this->filled('quantity')) {
            $merge['quantity'] = 1;
        }
        if ($merge) {
            $this->merge($merge);
        }
    }
}
