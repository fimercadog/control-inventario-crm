<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'booking_number',
        'client_id',
        'package_id',
        'destination_id',
        'travel_date',
        'return_date',
        'num_travelers',
        'total_amount',
        'paid_amount',
        'pending_amount',
        'status',
        'user_id',
        'notes',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'return_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function package()
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function destination()
    {
        return $this->belongsTo(TravelDestination::class, 'destination_id');
    }

    public function advisor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function travelers()
    {
        return $this->belongsToMany(TravelTraveler::class, 'travel_booking_travelers', 'booking_id', 'traveler_id');
    }

    public function itineraries()
    {
        return $this->hasMany(TravelItinerary::class, 'booking_id');
    }

    public function services()
    {
        return $this->hasMany(TravelService::class, 'booking_id');
    }

    public function documents()
    {
        return $this->hasMany(TravelDocument::class, 'booking_id');
    }
}
