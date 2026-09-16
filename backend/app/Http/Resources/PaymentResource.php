<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'direction' => $this->direction,
            'paid_at' => $this->paid_at?->toDateString(),
            'amount' => $this->amount,
            'method' => $this->method,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'target_type' => str_contains($this->payable_type ?? '', 'AccountReceivable') ? 'receivable' : 'payable',
            'target_id' => $this->payable_id,
            'cash_session_id' => $this->cash_session_id,
            'cash_movement_id' => $this->cash_movement_id,
            'created_at' => $this->created_at,
        ];
    }
}
