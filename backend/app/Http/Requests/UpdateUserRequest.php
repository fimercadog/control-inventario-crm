<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * Edición de usuario del panel. `company_id` nunca se toca en update (un usuario
 * no cambia de empresa en el modelo un-deploy-por-cliente). Todo campo es
 * `sometimes`: solo se actualiza lo que viene en el payload.
 */
class UpdateUserRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'email' => [
                'sometimes', 'email', 'max:150',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'max:255'],
            'status' => ['sometimes', 'in:active,inactive'],
            'role' => ['sometimes', 'nullable', 'string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
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
