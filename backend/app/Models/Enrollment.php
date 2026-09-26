<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'student_id',
        'team_id',
        'enrollment_number',
        'monthly_fee',
        'enrollment_fee',
        'billing_day',
        'start_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
        'enrollment_fee' => 'decimal:2',
        'billing_day' => 'integer',
        'start_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
