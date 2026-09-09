<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicalApplication extends Model
{
    use SoftDeletes;

    public const TYPES = ['vaccine', 'deworming'];

    protected $fillable = [
        'company_id', 'type', 'patient_id', 'product_id', 'consultation_id', 'vet_id',
        'stock_movement_id', 'name', 'applied_at', 'lot', 'expires_at', 'next_due_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'date',
            'expires_at' => 'date',
            'next_due_at' => 'date',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vet(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vet_id');
    }
}
