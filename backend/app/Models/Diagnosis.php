<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Diagnosis extends Model
{
    protected $table = 'diagnoses';

    protected $fillable = ['company_id', 'code', 'name', 'status'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function consultations(): BelongsToMany
    {
        return $this->belongsToMany(Consultation::class, 'consultation_diagnosis');
    }
}
