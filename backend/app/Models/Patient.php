<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;

    /** `photo_url` no es fillable: lo fija el servidor por POST /patients/{id}/photo. */
    protected $fillable = [
        'company_id', 'client_id', 'species_id', 'breed_id', 'name', 'sex',
        'birth_date', 'weight', 'microchip', 'sterilized', 'status',
        'document_type', 'document_number', 'first_name', 'last_name',
        'address', 'city', 'phone', 'emergency_contact_name',
        'emergency_contact_phone', 'health_coverage_provider', 'medical_history_summary',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'weight' => 'decimal:2',
            'sterilized' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function breed(): BelongsTo
    {
        return $this->belongsTo(Breed::class);
    }

    public function careEncounters(): HasMany
    {
        return $this->hasMany(CareEncounter::class);
    }
}
