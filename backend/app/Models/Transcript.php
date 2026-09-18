<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transcript extends Model
{
    protected $fillable = [
        'audio_recording_id',
        'raw_text',
        'transcription_provider',
        'language',
        'confidence_score',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence_score' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function audioRecording(): BelongsTo
    {
        return $this->belongsTo(AudioRecording::class);
    }
}
