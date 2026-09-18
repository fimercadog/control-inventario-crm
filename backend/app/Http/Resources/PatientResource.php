<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_name' => $this->first_name ?? $this->name,
            'last_name' => $this->last_name,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'health_coverage_provider' => $this->health_coverage_provider,
            'medical_history_summary' => $this->medical_history_summary,
            'sex' => $this->sex,
            'birth_date' => $this->birth_date?->toDateString(),
            'weight' => $this->weight,
            'microchip' => $this->microchip,
            'sterilized' => (bool) $this->sterilized,
            'photo_url' => $this->photo_url,
            'status' => $this->status,
            'client_id' => $this->client_id,
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'species_id' => $this->species_id,
            'species' => $this->whenLoaded('species', fn () => $this->species?->name),
            'breed_id' => $this->breed_id,
            'breed' => $this->whenLoaded('breed', fn () => $this->breed?->name),
            'deleted_at' => $this->deleted_at,
        ];
    }
}
