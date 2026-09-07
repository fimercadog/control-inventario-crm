<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StorePurchaseOrderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'supplier_id' => ['required', Rule::exists('suppliers', 'id')->where('company_id', $companyId)],
            'warehouse_id' => ['required', Rule::exists('warehouses', 'id')->where('company_id', $companyId)],
            'order_date' => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date'],
        ];
    }
}
