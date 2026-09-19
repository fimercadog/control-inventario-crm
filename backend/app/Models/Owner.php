<?php

namespace App\Models;

use App\Enums\OwnerStatus;
use Database\Factories\OwnerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Owner extends Model
{
    /** @use HasFactory<OwnerFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'document',
        'phone',
        'whatsapp',
        'email',
        'address',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => OwnerStatus::class,
        ];
    }

    /**
     * @return HasMany<Property, $this>
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
