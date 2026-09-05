<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'title' => $this->title,
            'amount' => $this->amount,
            'stage' => $this->stage,
            'expected_close_date' => $this->expected_close_date,
            'created_at' => $this->created_at,
        ];
    }
}
