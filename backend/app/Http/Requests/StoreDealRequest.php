<?php

namespace App\Http\Requests;

class StoreDealRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'title' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0'],
            'stage' => ['required', 'in:prospecting,qualification,proposal,negotiation,won,lost'],
            'expected_close_date' => ['nullable', 'date'],
        ];
    }
}
