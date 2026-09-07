<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreOrderRequest extends ApiFormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->filled('owner_id') && $this->isMethod('post')) {
            $this->merge(['owner_id' => $this->user()?->id]);
        }
    }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'client_id' => ['required', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'deal_id' => ['nullable', Rule::exists('deals', 'id')->where('company_id', $companyId)],
            'warehouse_id' => ['required', Rule::exists('warehouses', 'id')->where('company_id', $companyId)],
            'owner_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $companyId)],
        ];
    }
}
