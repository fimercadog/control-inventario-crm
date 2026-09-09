<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id', 'patient_id', 'appointment_id', 'vet_id', 'date', 'reason',
        'weight', 'temperature', 'subjective', 'objective', 'assessment', 'plan',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'weight' => 'decimal:2',
            'temperature' => 'decimal:1',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function vet(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vet_id');
    }

    public function diagnoses(): BelongsToMany
    {
        return $this->belongsToMany(Diagnosis::class, 'consultation_diagnosis');
    }
}
