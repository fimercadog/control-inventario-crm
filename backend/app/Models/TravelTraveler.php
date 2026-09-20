<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelTraveler extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'client_id',
        'first_name',
        'last_name',
        'document_type',
        'document_number',
        'passport_number',
        'passport_expiration',
        'nationality',
        'birth_date',
        'gender',
        'phone',
        'email',
        'special_requirements',
        'status',
    ];

    protected $casts = [
        'passport_expiration' => 'date',
        'birth_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function bookings()
    {
        return $this->belongsToMany(TravelBooking::class, 'travel_booking_travelers', 'traveler_id', 'booking_id');
    }
}
