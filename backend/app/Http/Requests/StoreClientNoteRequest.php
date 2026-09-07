<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreClientNoteRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')->where('company_id', $this->user()?->company_id)],
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
