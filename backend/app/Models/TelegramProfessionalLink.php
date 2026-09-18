<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramProfessionalLink extends Model
{
    protected $fillable = [
        'user_id',
        'telegram_chat_id',
        'telegram_user_id',
        'telegram_username',
        'is_verified',
        'verification_pin',
        'linked_at',
    ];

    protected function casts(): array
    {
        return [
            'telegram_chat_id' => 'integer',
            'telegram_user_id' => 'integer',
            'is_verified' => 'boolean',
            'linked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
