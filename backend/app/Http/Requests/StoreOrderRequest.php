<?php

namespace App\Http\Requests;

class StoreOrderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'deal_id' => ['nullable', 'exists:deals,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
        ];
    }
}
