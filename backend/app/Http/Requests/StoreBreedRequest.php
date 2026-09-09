<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreBreedRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:120',
                Rule::unique('breeds')
                    ->where(fn ($query) => $query
                        ->where('company_id', $this->user()?->company_id)
                        ->where('species_id', $this->input('species_id')))
                    ->ignore($this->route('breed')),
            ],
            'species_id' => [
                'required', 'integer',
                Rule::exists('species', 'id')->where('company_id', $this->user()?->company_id),
            ],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'name.unique' => 'Ya existe una raza con ese nombre para esa especie.',
            'species_id.exists' => 'La especie seleccionada no existe.',
        ];
    }
}
