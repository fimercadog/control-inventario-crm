<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Species extends Model
{
    protected $table = 'species';

    protected $fillable = ['company_id', 'name', 'status'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function breeds(): HasMany
    {
        return $this->hasMany(Breed::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }
}
