<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'species' => $this->whenLoaded('patient', fn () => $this->patient?->species?->name),
            'client_id' => $this->whenLoaded('patient', fn () => $this->patient?->client_id),
            'client' => $this->whenLoaded('patient', fn () => $this->patient?->client?->name),
            'service_id' => $this->service_id,
            'service' => $this->whenLoaded('service', fn () => $this->service?->name),
            'practitioner_id' => $this->practitioner_id,
            'practitioner' => $this->whenLoaded('practitioner', fn () => $this->practitioner?->name),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'duration_minutes' => $this->duration_minutes,
            'resource' => $this->resource,
            'reason' => $this->reason,
            'status' => $this->status,
            'notes' => $this->notes,
        ];
    }
}
