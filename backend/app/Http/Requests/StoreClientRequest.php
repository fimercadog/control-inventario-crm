<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreClientRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'segment_id' => ['nullable', 'integer', 'exists:segments,id'],
            'email' => [
                'nullable', 'email', 'max:150',
                Rule::unique('clients')
                    ->where('company_id', $this->user()?->company_id)
                    ->ignore($this->route('client')),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        // Sin esto, el fallo de unicidad hereda el mensaje generico de "email"
        // de ApiFormRequest ("El correo no tiene un formato valido").
        return parent::messages() + [
            'email.unique' => 'Ya hay un cliente con ese correo en la empresa.',
        ];
    }
}
