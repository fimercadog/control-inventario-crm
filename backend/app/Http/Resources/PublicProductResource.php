<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Vista publica de un producto del catalogo. Solo lo que puede ver un visitante
 * anonimo: nunca el costo, la existencia ni el punto de reorden.
 */
class PublicProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'unit_price' => $this->unit_price,
            'category' => $this->category?->name,
            'brand' => $this->brand?->name,
            'unit' => $this->unit?->name,
        ];
    }
}
