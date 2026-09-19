<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends BaseCrudController
{
    protected string $model = Property::class;

    protected string $resource = PropertyResource::class;

    protected array $with = ['owner', 'agent', 'images'];

    protected array $searchable = ['code', 'title', 'city', 'zone', 'address'];

    protected array $filterable = [
        'property_type' => 'property_type',
        'listing_type' => 'listing_type',
        'status' => 'status',
        'city' => 'city',
        'is_featured' => 'is_featured',
        'owner_id' => 'owner_id',
        'agent_id' => 'agent_id',
    ];

    public function options(): JsonResponse
    {
        return response()->json([
            'property_types' => [
                ['value' => 'apartment', 'label' => 'Apartamento'],
                ['value' => 'house', 'label' => 'Casa'],
                ['value' => 'office', 'label' => 'Oficina'],
                ['value' => 'commercial_premises', 'label' => 'Local Comercial'],
                ['value' => 'land', 'label' => 'Lote / Terreno'],
                ['value' => 'warehouse', 'label' => 'Bodega'],
                ['value' => 'farm', 'label' => 'Finca'],
            ],
            'listing_types' => [
                ['value' => 'sale', 'label' => 'Venta'],
                ['value' => 'rent', 'label' => 'Arriendo'],
                ['value' => 'both', 'label' => 'Venta o Arriendo'],
            ],
            'statuses' => [
                ['value' => 'draft', 'label' => 'Borrador'],
                ['value' => 'published', 'label' => 'Publicada'],
                ['value' => 'reserved', 'label' => 'Reservada'],
                ['value' => 'sold', 'label' => 'Vendida'],
                ['value' => 'rented', 'label' => 'Arrendada'],
                ['value' => 'inactive', 'label' => 'Inactiva'],
            ],
        ]);
    }

    public function bySlug(Request $request, string $slug): JsonResponse
    {
        $property = Property::where('company_id', $this->companyId($request))
            ->where('slug', $slug)
            ->with($this->with)
            ->firstOrFail();

        return response()->json([
            'data' => new PropertyResource($property),
        ]);
    }
}
