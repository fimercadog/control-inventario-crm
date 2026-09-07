<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreStockTransferRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('company_id', $this->companyId())],
            'from_warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')->where('company_id', $this->companyId())],
            'to_warehouse_id' => ['required', 'integer', 'different:from_warehouse_id', Rule::exists('warehouses', 'id')->where('company_id', $this->companyId())],
            'quantity' => ['required', 'integer', 'min:1'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'to_warehouse_id.different' => 'La bodega destino debe ser distinta de la de origen.',
        ];
    }

    private function companyId(): int
    {
        return (int) ($this->user()?->company_id ?? 1);
    }
}
