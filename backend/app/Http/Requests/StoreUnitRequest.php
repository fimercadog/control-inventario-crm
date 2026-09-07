<?php

namespace App\Http\Requests;

class StoreUnitRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'abbreviation' => ['nullable', 'string', 'max:12'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
