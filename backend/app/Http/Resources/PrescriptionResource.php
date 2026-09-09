<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'consultation_id' => $this->consultation_id,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'vet_id' => $this->vet_id,
            'vet' => $this->whenLoaded('vet', fn () => $this->vet?->name),
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'id' => $i->id,
                'product_id' => $i->product_id,
                'medication_name' => $i->medication_name,
                'sku' => $i->sku,
                'dosage' => $i->dosage,
                'frequency' => $i->frequency,
                'duration' => $i->duration,
            ])),
        ];
    }
}
