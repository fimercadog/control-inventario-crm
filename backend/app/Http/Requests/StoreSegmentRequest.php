<?php

namespace App\Http\Requests;

class StoreSegmentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
