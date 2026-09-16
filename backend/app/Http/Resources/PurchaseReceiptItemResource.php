<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseReceiptItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_order_item_id' => $this->purchase_order_item_id,
            'product_id' => $this->product_id,
            'product' => $this->product_name,
            'sku' => $this->sku,
            'quantity' => $this->quantity,
            'unit_cost' => $this->unit_cost,
            'line_total' => $this->line_total,
        ];
    }
}
