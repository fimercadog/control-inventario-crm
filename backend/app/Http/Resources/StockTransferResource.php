<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockTransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn () => $this->product?->name),
            'from_warehouse_id' => $this->from_warehouse_id,
            'from_warehouse' => $this->whenLoaded('fromWarehouse', fn () => $this->fromWarehouse?->name),
            'to_warehouse_id' => $this->to_warehouse_id,
            'to_warehouse' => $this->whenLoaded('toWarehouse', fn () => $this->toWarehouse?->name),
            'quantity' => $this->quantity,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
