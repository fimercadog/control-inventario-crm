<?php

namespace App\Http\Requests;

class StorePublicAppointmentBookingRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'species_id' => ['required', 'integer'],
            'breed_id' => ['nullable', 'integer'],
            'pet_name' => ['required', 'string', 'max:120'],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            // Ley 1581: consentimiento obligatorio.
            'consent' => ['accepted'],
            // Honeypot: campo oculto. Si viene relleno, el controller descarta
            // la solicitud en silencio (no 422, para no darle señal al bot).
            'company_website' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'consent.accepted' => 'Debes autorizar el tratamiento de datos para agendar.',
        ];
    }
}
