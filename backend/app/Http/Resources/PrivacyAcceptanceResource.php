<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrivacyAcceptanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'user_id' => $this->user_id,
            'telegram_chat_id' => $this->telegram_chat_id,
            'policy_version' => $this->policy_version,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
