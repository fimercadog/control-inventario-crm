<?php

namespace App\Http\Requests;

class StorePurchaseOrderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'order_date' => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date'],
        ];
    }
}
