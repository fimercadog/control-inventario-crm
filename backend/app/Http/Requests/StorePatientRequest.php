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
            'client_id' => ['required', 'integer', $inCompany('clients')],
            'species_id' => ['required', 'integer', $inCompany('species')],
            'breed_id' => ['nullable', 'integer', $inCompany('breeds')],
            'name' => ['required', 'string', 'max:120'],
            'sex' => ['required', 'in:male,female,unknown'],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'microchip' => [
                'nullable', 'string', 'max:60',
                Rule::unique('patients')
                    ->where('company_id', $companyId)
                    ->ignore($this->route('patient')),
            ],
            'sterilized' => ['boolean'],
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
