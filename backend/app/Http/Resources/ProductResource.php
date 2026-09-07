<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'is_public' => (bool) $this->is_public,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'unit_id' => $this->unit_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'unit' => $this->whenLoaded('unit', fn () => $this->unit?->name),
            'unit_price' => $this->unit_price,
            'cost_price' => $this->cost_price,
            'reorder_level' => $this->reorder_level,
            'stock_on_hand' => $this->when(isset($this->stock_on_hand), fn () => (int) $this->stock_on_hand),
            'status' => $this->status,
        ];
    }
}
