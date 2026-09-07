<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreContactRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $this->user()?->company_id)],
            'name' => ['required', 'string', 'max:150'],
            'role' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
