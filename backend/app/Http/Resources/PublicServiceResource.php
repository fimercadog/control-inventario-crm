<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Vista publica de un servicio veterinario: lo que puede ver un visitante anonimo. */
class PublicServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
        ];
    }
}
