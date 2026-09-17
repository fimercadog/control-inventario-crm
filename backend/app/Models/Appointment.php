<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    public const STATUSES = ['scheduled', 'confirmed', 'attended', 'no_show', 'cancelled'];

    protected $attributes = ['status' => 'scheduled'];

    protected $fillable = [
        'company_id', 'patient_id', 'service_id', 'practitioner_id',
        'starts_at', 'ends_at', 'duration_minutes', 'resource', 'reason', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'duration_minutes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment): void {
            if (! $appointment->duration_minutes && $appointment->starts_at && $appointment->ends_at) {
                $start = \Carbon\Carbon::parse($appointment->starts_at);
                $end = \Carbon\Carbon::parse($appointment->ends_at);
                $appointment->duration_minutes = max(1, (int) $start->diffInMinutes($end));
            }
        });

        static::updating(function (Appointment $appointment): void {
            if ($appointment->isDirty(['starts_at', 'ends_at']) && $appointment->starts_at && $appointment->ends_at) {
                $start = \Carbon\Carbon::parse($appointment->starts_at);
                $end = \Carbon\Carbon::parse($appointment->ends_at);
                $appointment->duration_minutes = max(1, (int) $start->diffInMinutes($end));
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'practitioner_id');
    }
}
