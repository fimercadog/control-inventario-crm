<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareEncounterItem extends Model
{
    protected $fillable = [
        'company_id',
        'care_encounter_id',
        'sequence_number',
        'item_type',
        'segment_id',
        'telegram_message_id',
        'text_content',
        'audio_recording_id',
        'duration_seconds',
        'file_size_bytes',
        'status',
        'error_message',
        'started_at',
        'received_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'sequence_number' => 'integer',
            'duration_seconds' => 'integer',
            'file_size_bytes' => 'integer',
            'started_at' => 'datetime',
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function careEncounter(): BelongsTo
    {
        return $this->belongsTo(CareEncounter::class);
    }

    public function audioRecording(): BelongsTo
    {
        return $this->belongsTo(AudioRecording::class);
    }
}
