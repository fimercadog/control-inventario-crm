<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicalNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'care_encounter_id',
        'transcript_id',
        'template_type',
        'note_status',
        'title',
        'summary_text',
        'structured_content_json',
        'vitals_json',
        'ai_uncertainties_json',
        'confirmed_by_user_id',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'structured_content_json' => 'array',
            'vitals_json' => 'array',
            'ai_uncertainties_json' => 'array',
            'confirmed_at' => 'datetime',
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

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(Transcript::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by_user_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(NoteVersion::class)->orderBy('version_number', 'desc');
    }

    public function addendums(): HasMany
    {
        return $this->hasMany(NoteAddendum::class)->orderBy('created_at', 'asc');
    }
}
