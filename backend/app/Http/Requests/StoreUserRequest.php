<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * Alta de usuario del panel. `company_id` NO se acepta del payload: lo fija el
 * controller desde la empresa del usuario autenticado. `status` y `role` sí son
 * campos legítimos de administración, pero validados.
 */
class StoreUserRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'email.unique' => 'Ya existe un usuario con ese correo.',
            'role.exists' => 'El rol seleccionado no existe.',
        ];
    }
}
