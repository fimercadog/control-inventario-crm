<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'product_id' => ['required', Rule::exists('products', 'id')->where('company_id', $companyId)],
            'warehouse_id' => ['required', Rule::exists('warehouses', 'id')->where('company_id', $companyId)],
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * El signo de `quantity` codifica el sentido del movimiento: una salida
     * siempre resta del stock (SUM(quantity) por producto+bodega). El usuario
     * solo captura una cantidad positiva; el signo lo decide el tipo.
     */
    protected function passedValidation(): void
    {
        if ($this->input('type') === 'out') {
            $this->merge(['quantity' => -abs((int) $this->input('quantity'))]);
        } else {
            $this->merge(['quantity' => abs((int) $this->input('quantity'))]);
        }
    }
}
