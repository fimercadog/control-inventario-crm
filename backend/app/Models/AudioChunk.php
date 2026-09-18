<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudioChunk extends Model
{
    protected $fillable = [
        'audio_recording_id',
        'chunk_index',
        'file_path',
        'duration_seconds',
        'start_offset_sec',
        'end_offset_sec',
        'status',
        'transcript_text',
    ];

    protected function casts(): array
    {
        return [
            'chunk_index' => 'integer',
            'duration_seconds' => 'integer',
            'start_offset_sec' => 'integer',
            'end_offset_sec' => 'integer',
        ];
    }

    public function audioRecording(): BelongsTo
    {
        return $this->belongsTo(AudioRecording::class);
    }
}
