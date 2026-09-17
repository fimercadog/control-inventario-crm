<?php

namespace App\Http\Requests;

use App\Models\Breed;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePatientRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $inCompany = fn (string $table) => Rule::exists($table, 'id')->where('company_id', $companyId);

        return [
            'client_id' => ['sometimes', 'nullable', 'integer', $inCompany('clients')],
            'species_id' => ['sometimes', 'nullable', 'integer', $inCompany('species')],
            'breed_id' => ['sometimes', 'nullable', 'integer', $inCompany('breeds')],
            'name' => ['required', 'string', 'max:120'],
            'document_type' => ['nullable', 'string', 'max:20', Rule::in(['CC', 'CE', 'TI', 'PA', 'RC', 'PEP', 'NIT', 'other'])],
            'document_number' => ['nullable', 'string', 'max:40'],
            'first_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:80'],
            'sex' => ['required', 'in:male,female,other,unknown'],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'blood_type' => ['nullable', 'string', Rule::in(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])],
            'eps' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:120'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'microchip' => [
                'nullable', 'string', 'max:60',
                Rule::unique('patients')
                    ->where('company_id', $companyId)
                    ->ignore($this->route('patient')),
            ],
            'sterilized' => ['nullable', 'boolean'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $breedId = $this->input('breed_id');
            $speciesId = $this->input('species_id');
            if (! $breedId || ! $speciesId) {
                return;
            }

            $matches = Breed::query()
                ->where('id', $breedId)
                ->where('species_id', $speciesId)
                ->exists();

            if (! $matches) {
                $validator->errors()->add('breed_id', 'La raza no corresponde a la especie seleccionada.');
            }
        });
    }

    public function messages(): array
    {
        return parent::messages() + [
            'microchip.unique' => 'Ya hay un paciente con ese microchip.',
        ];
    }
}
