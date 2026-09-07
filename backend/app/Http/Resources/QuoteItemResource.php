<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            // Snapshot: lo que se cotizo, aunque el producto se haya eliminado despues.
            'product' => $this->product_name ?? $this->whenLoaded('product', fn () => $this->product?->name),
            'sku' => $this->sku,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
        ];
    }
}
