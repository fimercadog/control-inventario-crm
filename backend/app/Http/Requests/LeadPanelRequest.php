<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * Alta / edicion de un lead desde el panel (usuario con leads.view). A diferencia
 * de StoreLeadRequest no pide `consent`: lo captura el equipo comercial cuando el
 * lead llega por telefono o en persona, no un checkbox del sitio.
 */
class LeadPanelRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(['new', 'contacted', 'discarded'])],
        ];
    }

    public function attributes(): array
    {
        return parent::attributes() + ['company_name' => 'empresa', 'phone' => 'telefono', 'message' => 'mensaje'];
    }
}
