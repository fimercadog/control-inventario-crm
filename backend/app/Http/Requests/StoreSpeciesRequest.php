<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreSpeciesRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:120',
                Rule::unique('species')
                    ->where('company_id', $this->user()?->company_id)
                    ->ignore($this->route('species')),
            ],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'name.unique' => 'Ya existe una especie con ese nombre.',
        ];
    }
}
