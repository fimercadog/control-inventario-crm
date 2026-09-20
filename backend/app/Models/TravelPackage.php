<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'destination_id',
        'name',
        'code',
        'duration_days',
        'duration_nights',
        'departure_date',
        'price',
        'available_slots',
        'includes',
        'excludes',
        'is_featured',
        'image_url',
        'status',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'departure_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function destination()
    {
        return $this->belongsTo(TravelDestination::class, 'destination_id');
    }

    public function itineraries()
    {
        return $this->hasMany(TravelItinerary::class, 'package_id');
    }

    public function bookings()
    {
        return $this->hasMany(TravelBooking::class, 'package_id');
    }
}
