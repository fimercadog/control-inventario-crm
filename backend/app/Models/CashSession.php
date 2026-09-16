<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashSession extends Model
{
    protected $fillable = [
        'company_id', 'cash_register_id', 'opened_by', 'closed_by', 'opened_at',
        'closed_at', 'opening_amount', 'expected_amount', 'closing_amount',
        'difference', 'status', 'notes', 'idempotency_key',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_amount' => 'decimal:2',
        'expected_amount' => 'decimal:2',
        'closing_amount' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function register(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(CashMovement::class);
    }
}
