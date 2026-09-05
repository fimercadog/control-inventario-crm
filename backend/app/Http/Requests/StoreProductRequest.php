<?php

namespace App\Http\Requests;

class StoreProductRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'unit' => ['required', 'string', 'max:30'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
