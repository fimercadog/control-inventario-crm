<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelItinerary extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'booking_id',
        'package_id',
        'day_number',
        'title',
        'description',
        'activity_date',
        'location',
        'included_services',
        'notes',
    ];

    protected $casts = [
        'activity_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function booking()
    {
        return $this->belongsTo(TravelBooking::class, 'booking_id');
    }

    public function package()
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }
}
