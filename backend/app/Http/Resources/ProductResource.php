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
            'category' => $this->category,
            'unit' => $this->unit,
            'unit_price' => $this->unit_price,
            'cost_price' => $this->cost_price,
            'reorder_level' => $this->reorder_level,
            'stock_on_hand' => $this->when(isset($this->stock_on_hand), fn () => (int) $this->stock_on_hand),
            'status' => $this->status,
        ];
    }
}
