<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cash_register_id' => $this->cash_register_id,
            'register' => new CashRegisterResource($this->whenLoaded('register')),
            'opened_at' => $this->opened_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'opening_amount' => $this->opening_amount,
            'expected_amount' => $this->expected_amount,
            'closing_amount' => $this->closing_amount,
            'difference' => $this->difference,
            'status' => $this->status,
            'notes' => $this->notes,
            'movements' => CashMovementResource::collection($this->whenLoaded('movements')),
            'created_at' => $this->created_at,
        ];
    }
}
