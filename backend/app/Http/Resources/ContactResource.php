<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'email' => $this->email,
            'phone' => $this->phone,
            'notes' => $this->notes,
            'status' => $this->status,
            'client_id' => $this->client_id,
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'created_at' => $this->created_at,
        ];
    }
}
