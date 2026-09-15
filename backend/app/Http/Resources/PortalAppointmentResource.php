<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Vista de una cita para el propio dueño en el portal (S14). A diferencia de
 * AppointmentResource (staff), nunca expone `notes` -- son anotaciones
 * internas del equipo clínico, no algo para el dueño.
 */
class PortalAppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'service_id' => $this->service_id,
            'service' => $this->whenLoaded('service', fn () => $this->service?->name),
            'practitioner' => $this->whenLoaded('practitioner', fn () => $this->practitioner?->name),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'status' => $this->status,
        ];
    }
}
