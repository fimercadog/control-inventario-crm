<?php

namespace App\Models;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'slug',
        'title',
        'description',
        'property_type',
        'listing_type',
        'status',
        'is_featured',
        'owner_id',
        'agent_id',
        'city',
        'zone',
        'address',
        'price',
        'admin_fee',
        'stratum',
        'bedrooms',
        'bathrooms',
        'parking_spots',
        'built_area',
        'private_area',
        'year_built',
        'features',
        'notes',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'property_type' => PropertyType::class,
            'listing_type' => ListingType::class,
            'status' => PropertyStatus::class,
            'is_featured' => 'boolean',
            'price' => 'decimal:2',
            'admin_fee' => 'decimal:2',
            'built_area' => 'decimal:2',
            'private_area' => 'decimal:2',
            'features' => 'array',
            'published_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        // Not concurrency-safe (max()+1 race under simultaneous writes); acceptable for the current single-writer SQLite setup.
        static::creating(function (Property $property): void {
            if (! $property->code) {
                $property->code = 'PROP-'.str_pad((string) (static::max('id') + 1), 5, '0', STR_PAD_LEFT);
            }

            if (! $property->slug) {
                $property->slug = static::buildSlug($property);
            }
        });
    }

    private static function buildSlug(Property $property): string
    {
        $location = $property->zone ?: $property->city;
        $type = $property->property_type instanceof PropertyType ? $property->property_type->value : $property->property_type;
        $listing = $property->listing_type instanceof ListingType ? $property->listing_type->value : $property->listing_type;

        return Str::slug("{$type} en {$listing} {$location} {$property->city}").'-'.Str::slug($property->code);
    }

    /**
     * @return BelongsTo<Owner, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * @return HasMany<PropertyImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    /**
     * Commercial statuses that are still eligible for public visibility.
     * Sold/rented/inactive/draft properties must disappear from the public
     * site even if published_at was never cleared.
     *
     * @return list<PropertyStatus>
     */
    private static function publiclyVisibleStatuses(): array
    {
        return [PropertyStatus::Disponible, PropertyStatus::Reservado];
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null
            && $this->published_at->lte(now())
            && in_array($this->status, self::publiclyVisibleStatuses(), true);
    }

    /**
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereIn('status', self::publiclyVisibleStatuses());
    }
}
