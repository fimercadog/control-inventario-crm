<?php

namespace App\Http\Requests;

class StorePortalLoginRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:150'],
            // Honeypot: campo oculto. Si viene relleno, el controller descarta
            // la solicitud en silencio (no 422, para no darle señal al bot).
            'company_website' => ['nullable', 'string'],
        ];
    }
}
