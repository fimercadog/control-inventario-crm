<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreDiagnosisRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'max:30'],
            'name' => [
                'required', 'string', 'max:200',
                Rule::unique('diagnoses')
                    ->where('company_id', $this->user()?->company_id)
                    ->ignore($this->route('diagnosis')),
            ],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + ['name.unique' => 'Ya existe un diagnóstico con ese nombre.'];
    }
}
