<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'appointment_id' => $this->appointment_id,
            'vet_id' => $this->vet_id,
            'vet' => $this->whenLoaded('vet', fn () => $this->vet?->name),
            'date' => $this->date?->toDateString(),
            'reason' => $this->reason,
            'weight' => $this->weight,
            'temperature' => $this->temperature,
            'subjective' => $this->subjective,
            'objective' => $this->objective,
            'assessment' => $this->assessment,
            'plan' => $this->plan,
            'created_at' => $this->created_at,
        ];
    }
}
