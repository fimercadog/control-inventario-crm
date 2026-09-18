<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class CareEncounter extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'patient_id',
        'professional_id',
        'appointment_id',
        'encounter_code',
        'started_at',
        'completed_at',
        'encounter_type',
        'channel',
        'status',
        'notes_summary',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
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

    public function professional(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function audioRecordings(): HasMany
    {
        return $this->hasMany(AudioRecording::class);
    }

    public function clinicalNote(): HasOne
    {
        return $this->hasOne(ClinicalNote::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CareEncounterItem::class)->orderBy('sequence_number', 'asc');
    }
}
