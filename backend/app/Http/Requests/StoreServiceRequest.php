<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreServiceRequest extends ApiFormRequest
{
    public const TYPES = [
        'consulta', 'vacunacion', 'cirugia', 'curacion', 'hospitalizacion', 'peluqueria', 'otro',
    ];

    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:150',
                Rule::unique('services')
                    ->where('company_id', $this->user()?->company_id)
                    ->ignore($this->route('service')),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', Rule::in(self::TYPES)],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'name.unique' => 'Ya existe un servicio con ese nombre.',
        ];
    }
}
