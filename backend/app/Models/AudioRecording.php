<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AudioRecording extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'care_encounter_id',
        'telegram_file_id',
        'original_filename',
        'file_path',
        'file_size_bytes',
        'mime_type',
        'duration_seconds',
        'sha256_hash',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'file_size_bytes' => 'integer',
            'duration_seconds' => 'integer',
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

    public function chunks(): HasMany
    {
        return $this->hasMany(AudioChunk::class);
    }

    public function transcript(): HasOne
    {
        return $this->hasOne(Transcript::class);
    }
}
