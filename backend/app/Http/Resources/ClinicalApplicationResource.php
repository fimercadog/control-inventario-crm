<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClinicalApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient?->name),
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn () => $this->product?->name),
            'consultation_id' => $this->consultation_id,
            'vet_id' => $this->vet_id,
            'vet' => $this->whenLoaded('vet', fn () => $this->vet?->name),
            'stock_movement_id' => $this->stock_movement_id,
            'name' => $this->name,
            'applied_at' => $this->applied_at?->toDateString(),
            'lot' => $this->lot,
            'expires_at' => $this->expires_at?->toDateString(),
            'next_due_at' => $this->next_due_at?->toDateString(),
        ];
    }
}
