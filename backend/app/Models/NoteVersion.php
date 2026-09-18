<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoteVersion extends Model
{
    protected $fillable = [
        'clinical_note_id',
        'version_number',
        'snapshot_json',
        'changed_by_user_id',
        'change_type',
    ];

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'snapshot_json' => 'array',
        ];
    }

    public function clinicalNote(): BelongsTo
    {
        return $this->belongsTo(ClinicalNote::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
