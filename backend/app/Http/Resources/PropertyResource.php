<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'code' => $this->code,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'property_type' => is_object($this->property_type) ? $this->property_type->value : $this->property_type,
            'listing_type' => is_object($this->listing_type) ? $this->listing_type->value : $this->listing_type,
            'status' => is_object($this->status) ? $this->status->value : $this->status,
            'is_featured' => (bool) $this->is_featured,
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'phone' => $this->owner->phone,
                'email' => $this->owner->email,
            ]),
            'agent' => $this->whenLoaded('agent', fn () => [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
                'email' => $this->agent->email,
            ]),
            'owner_id' => $this->owner_id,
            'agent_id' => $this->agent_id,
            'city' => $this->city,
            'zone' => $this->zone,
            'address' => $this->address,
            'price' => (float) $this->price,
            'admin_fee' => $this->admin_fee !== null ? (float) $this->admin_fee : null,
            'stratum' => $this->stratum,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking_spots' => $this->parking_spots,
            'built_area' => $this->built_area !== null ? (float) $this->built_area : null,
            'private_area' => $this->private_area !== null ? (float) $this->private_area : null,
            'year_built' => $this->year_built,
            'features' => $this->features ?? [],
            'notes' => $this->notes,
            'published_at' => $this->published_at?->toDateString(),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => method_exists($image, 'url') ? $image->url() : $image->path,
                'alt' => $image->alt,
                'sort_order' => $image->sort_order,
                'is_cover' => (bool) $image->is_cover,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
