<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'booking_id',
        'document_type',
        'title',
        'document_number',
        'file_url',
        'issued_at',
        'notes',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function booking()
    {
        return $this->belongsTo(TravelBooking::class, 'booking_id');
    }
}
