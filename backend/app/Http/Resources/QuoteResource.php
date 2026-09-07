<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'client_id' => $this->client_id,
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'deal_id' => $this->deal_id,
            'deal' => $this->whenLoaded('deal', fn () => $this->deal?->title),
            'status' => $this->status,
            'valid_until' => $this->valid_until?->toDateString(),
            'notes' => $this->notes,
            'total' => $this->total,
            'converted_order_id' => $this->converted_order_id,
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
        ];
    }
}
