<?php

namespace App\Models;

use Database\Factories\PropertyImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PropertyImage extends Model
{
    /** @use HasFactory<PropertyImageFactory> */
    use HasFactory;

    protected $fillable = [
        'property_id',
        'path',
        'alt',
        'sort_order',
        'is_cover',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_cover' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
