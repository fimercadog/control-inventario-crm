<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\TravelPackage;
use Illuminate\Http\Request;

class TravelPackageController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = TravelPackage::with('destination')->where('company_id', $companyId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);
        $validated = $request->validate([
            'destination_id' => 'nullable|exists:travel_destinations,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'duration_days' => 'integer|min:1',
            'duration_nights' => 'integer|min:0',
            'departure_date' => 'nullable|date',
            'price' => 'numeric|min:0',
            'available_slots' => 'integer|min:0',
            'includes' => 'nullable|string',
            'excludes' => 'nullable|string',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $package = TravelPackage::create(array_merge($validated, ['company_id' => $companyId]));
        return response()->json($package->load('destination'), 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $package = TravelPackage::with(['destination', 'itineraries'])->where('company_id', $companyId)->findOrFail($id);
        return response()->json($package);
    }

    public function update(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $package = TravelPackage::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'destination_id' => 'nullable|exists:travel_destinations,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'duration_days' => 'integer|min:1',
            'duration_nights' => 'integer|min:0',
            'departure_date' => 'nullable|date',
            'price' => 'numeric|min:0',
            'available_slots' => 'integer|min:0',
            'includes' => 'nullable|string',
            'excludes' => 'nullable|string',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $package->update($validated);
        return response()->json($package->load('destination'));
    }

    public function destroy(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $package = TravelPackage::where('company_id', $companyId)->findOrFail($id);
        $package->delete();
        return response()->json(['message' => 'Paquete eliminado']);
    }
}
