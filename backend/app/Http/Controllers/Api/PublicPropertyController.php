<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPropertyController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request): JsonResponse
    {
        $query = Property::query()
            ->where('company_id', $this->companyId($request))
            ->where('status', 'published')
            ->with(['images', 'agent']);

        if ($request->filled('property_type') && $request->input('property_type') !== 'all') {
            $query->where('property_type', $request->input('property_type'));
        }

        if ($request->filled('listing_type') && $request->input('listing_type') !== 'all') {
            $query->where('listing_type', $request->input('listing_type'));
        }

        if ($request->filled('city') && $request->input('city') !== 'all') {
            $query->where('city', $request->input('city'));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', (int) $request->input('bedrooms'));
        }

        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', (int) $request->input('bathrooms'));
        }

        if ($request->boolean('is_featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('q')) {
            $term = '%'.addcslashes((string) $request->string('q'), '%_\\').'%';
            $query->where(function ($sub) use ($term) {
                $sub->where('title', 'like', $term)
                    ->orWhere('code', 'like', $term)
                    ->orWhere('city', 'like', $term)
                    ->orWhere('zone', 'like', $term)
                    ->orWhere('address', 'like', $term);
            });
        }

        $properties = $query->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(max(1, min((int) $request->input('per_page', 12), 36)));

        return response()->json([
            'data' => PropertyResource::collection($properties->items()),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function show(Request $request, string $slugOrId): JsonResponse
    {
        $property = Property::query()
            ->where('company_id', $this->companyId($request))
            ->where('status', 'published')
            ->where(function ($query) use ($slugOrId) {
                $query->where('slug', $slugOrId)
                    ->orWhere('id', $slugOrId)
                    ->orWhere('code', $slugOrId);
            })
            ->with(['images', 'agent', 'owner'])
            ->firstOrFail();

        return response()->json([
            'data' => new PropertyResource($property),
        ]);
    }

    public function lead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'property_id' => 'nullable|exists:properties,id',
            'message' => 'nullable|string',
            'interest_type' => 'nullable|string',
        ]);

        $companyId = $this->companyId($request);

        $lead = Lead::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => 'new',
            'notes' => "Interés inmobiliario: ".($validated['interest_type'] ?? 'Consulta general').
                ($validated['message'] ? "\nMensaje: ".$validated['message'] : '').
                ($validated['property_id'] ? "\nPropiedad ID: ".$validated['property_id'] : ''),
        ]);

        return response()->json([
            'message' => 'Solicitud recibida exitosamente. Un asesor se pondrá en contacto pronto.',
            'lead_id' => $lead->id,
        ], 201);
    }
}
