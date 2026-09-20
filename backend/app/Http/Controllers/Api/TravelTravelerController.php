<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\TravelTraveler;
use Illuminate\Http\Request;

class TravelTravelerController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = TravelTraveler::with('client')->where('company_id', $companyId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%")
                  ->orWhere('passport_number', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'document_type' => 'nullable|string|max:50',
            'document_number' => 'required|string|max:100',
            'passport_number' => 'nullable|string|max:100',
            'passport_expiration' => 'nullable|date',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'special_requirements' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $traveler = TravelTraveler::create(array_merge($validated, ['company_id' => $companyId]));
        return response()->json($traveler->load('client'), 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $traveler = TravelTraveler::with(['client', 'bookings'])->where('company_id', $companyId)->findOrFail($id);
        return response()->json($traveler);
    }

    public function update(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $traveler = TravelTraveler::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'document_type' => 'nullable|string|max:50',
            'document_number' => 'sometimes|required|string|max:100',
            'passport_number' => 'nullable|string|max:100',
            'passport_expiration' => 'nullable|date',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'special_requirements' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $traveler->update($validated);
        return response()->json($traveler->load('client'));
    }

    public function destroy(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $traveler = TravelTraveler::where('company_id', $companyId)->findOrFail($id);
        $traveler->delete();
        return response()->json(['message' => 'Viajero eliminado']);
    }
}
