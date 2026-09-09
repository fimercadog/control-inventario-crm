<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Breed extends Model
{
    protected $fillable = ['company_id', 'species_id', 'name', 'status'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }
}
