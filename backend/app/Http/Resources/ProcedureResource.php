<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcedureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'service_id' => $this->service_id,
            'service' => $this->whenLoaded('service', fn () => $this->service?->name),
            'vet_id' => $this->vet_id,
            'vet' => $this->whenLoaded('vet', fn () => $this->vet?->name),
            'type' => $this->type,
            'performed_at' => $this->performed_at?->toDateString(),
            'notes' => $this->notes,
            'consent_document_url' => $this->consent_document_url,
        ];
    }
}
