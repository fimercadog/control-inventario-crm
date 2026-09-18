<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TelegramLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'telegram_chat_id' => $this->telegram_chat_id,
            'telegram_user_id' => $this->telegram_user_id,
            'telegram_username' => $this->telegram_username,
            'is_verified' => $this->is_verified,
            'linked_at' => $this->linked_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
