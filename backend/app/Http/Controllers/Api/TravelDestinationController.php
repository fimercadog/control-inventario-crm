<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\TravelDestination;
use Illuminate\Http\Request;

class TravelDestinationController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = TravelDestination::where('company_id', $companyId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'country' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'season' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'highlights' => 'nullable|string',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $destination = TravelDestination::create(array_merge($validated, ['company_id' => $companyId]));
        return response()->json($destination, 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $destination = TravelDestination::where('company_id', $companyId)->findOrFail($id);
        return response()->json($destination);
    }

    public function update(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $destination = TravelDestination::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'country' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'season' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'highlights' => 'nullable|string',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $destination->update($validated);
        return response()->json($destination);
    }

    public function destroy(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $destination = TravelDestination::where('company_id', $companyId)->findOrFail($id);
        $destination->delete();
        return response()->json(['message' => 'Destino eliminado']);
    }
}
