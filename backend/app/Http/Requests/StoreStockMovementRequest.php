<?php

namespace App\Http\Requests;

class StoreStockMovementRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
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
