<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'document' => $this->document,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'address' => $this->address,
            'notes' => $this->notes,
            'status' => is_object($this->status) ? $this->status->value : $this->status,
            'properties_count' => $this->whenCounted('properties'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
