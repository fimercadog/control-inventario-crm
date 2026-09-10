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

        // El descuento de stock se hace UNA vez, al crear. En una edición no se
        // puede cambiar el producto/bodega/cantidad: el movimiento ya existe y
        // no se recalcula (la corrección es un ajuste manual de inventario).
        $frozenOnUpdate = Rule::prohibitedIf(fn () => $this->route('clinical_application') !== null);

        return [
            'type' => ['required', Rule::in(ClinicalApplication::TYPES)],
            'patient_id' => ['required', 'integer', $inCompany('patients')->whereNull('deleted_at')],
            'product_id' => ['nullable', $frozenOnUpdate, 'integer', $inCompany('products')],
            'consultation_id' => ['nullable', 'integer', $inCompany('consultations')->whereNull('deleted_at')],
            'warehouse_id' => ['nullable', $frozenOnUpdate, 'integer', 'required_with:product_id', $inCompany('warehouses')],
            'quantity' => ['nullable', $frozenOnUpdate, 'integer', 'min:1', 'max:1000'],
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
        // En update no se rellenan defaults: los campos congelados (quantity)
        // no deben aparecer en el payload o `prohibitedIf` los rechaza.
        if ($this->route('clinical_application') !== null) {
            return;
        }

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
