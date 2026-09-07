<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'body' => $this->body,
            'author' => $this->whenLoaded('author', fn () => $this->author?->name),
            'created_at' => $this->created_at,
        ];
    }
}
