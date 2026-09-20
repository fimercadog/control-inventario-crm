<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelService extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'booking_id',
        'supplier_id',
        'service_type',
        'name',
        'supplier_reference',
        'start_date',
        'end_date',
        'cost_price',
        'selling_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function booking()
    {
        return $this->belongsTo(TravelBooking::class, 'booking_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
