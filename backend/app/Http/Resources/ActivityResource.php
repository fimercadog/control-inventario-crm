<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'deal_id' => $this->deal_id,
            'deal' => new DealResource($this->whenLoaded('deal')),
            'type' => $this->type,
            'subject' => $this->subject,
            'notes' => $this->notes,
            'due_date' => $this->due_date,
            'completed' => $this->completed,
            'created_at' => $this->created_at,
        ];
    }
}
