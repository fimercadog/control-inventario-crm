<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->product_name ?? $this->whenLoaded('product', fn () => $this->product?->name),
            'sku' => $this->sku,
            'quantity' => $this->quantity,
            'received_quantity' => $this->received_quantity,
            'pending_quantity' => method_exists($this->resource, 'pendingQuantity') ? $this->pendingQuantity() : null,
            'unit_cost' => $this->unit_cost,
            'discount' => $this->discount,
            'tax' => $this->tax,
            'line_total' => $this->line_total,
        ];
    }
}
