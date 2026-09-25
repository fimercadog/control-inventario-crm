<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyLease extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'property_leases';

    protected $fillable = [
        'company_id',
        'property_id',
        'client_id',
        'contract_number',
        'monthly_rent',
        'deposit_amount',
        'start_date',
        'end_date',
        'payment_day',
        'status',
        'notes',
    ];

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_day' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
