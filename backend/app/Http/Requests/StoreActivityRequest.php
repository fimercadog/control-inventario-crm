<?php

namespace App\Http\Requests;

class StoreActivityRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'exists:clients,id'],
            'deal_id' => ['nullable', 'exists:deals,id'],
            'type' => ['required', 'in:call,meeting,email,note'],
            'subject' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'completed' => ['boolean'],
        ];
    }
}
