<?php

namespace App\Http\Requests;

class ReschedulePortalAppointmentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
        ];
    }
}
