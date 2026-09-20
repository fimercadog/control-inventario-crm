<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelDestination extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'country',
        'city',
        'season',
        'description',
        'highlights',
        'is_featured',
        'image_url',
        'status',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function packages()
    {
        return $this->hasMany(TravelPackage::class, 'destination_id');
    }

    public function bookings()
    {
        return $this->hasMany(TravelBooking::class, 'destination_id');
    }
}
