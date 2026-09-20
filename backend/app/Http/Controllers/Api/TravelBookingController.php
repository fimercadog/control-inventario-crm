<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\TravelBooking;
use Illuminate\Http\Request;

class TravelBookingController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = TravelBooking::with(['client', 'package', 'destination', 'advisor', 'travelers'])
            ->where('company_id', $companyId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $companyId = $this->companyId($request);
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'package_id' => 'nullable|exists:travel_packages,id',
            'destination_id' => 'nullable|exists:travel_destinations,id',
            'travel_date' => 'required|date',
            'return_date' => 'nullable|date',
            'num_travelers' => 'integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'numeric|min:0',
            'status' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'traveler_ids' => 'nullable|array',
            'traveler_ids.*' => 'exists:travel_travelers,id',
        ]);

        $bookingNumber = 'RES-' . strtoupper(uniqid());
        $paidAmount = $validated['paid_amount'] ?? 0;
        $pendingAmount = max(0, $validated['total_amount'] - $paidAmount);

        $booking = TravelBooking::create(array_merge($validated, [
            'company_id' => $companyId,
            'booking_number' => $bookingNumber,
            'paid_amount' => $paidAmount,
            'pending_amount' => $pendingAmount,
            'status' => $validated['status'] ?? 'quoted',
        ]));

        if (!empty($validated['traveler_ids'])) {
            $booking->travelers()->sync($validated['traveler_ids']);
        }

        return response()->json($booking->load(['client', 'package', 'destination', 'travelers']), 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $booking = TravelBooking::with(['client', 'package', 'destination', 'advisor', 'travelers', 'itineraries', 'services', 'documents'])
            ->where('company_id', $companyId)
            ->findOrFail($id);
        return response()->json($booking);
    }

    public function update(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $booking = TravelBooking::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'client_id' => 'sometimes|required|exists:clients,id',
            'package_id' => 'nullable|exists:travel_packages,id',
            'destination_id' => 'nullable|exists:travel_destinations,id',
            'travel_date' => 'sometimes|required|date',
            'return_date' => 'nullable|date',
            'num_travelers' => 'integer|min:1',
            'total_amount' => 'numeric|min:0',
            'paid_amount' => 'numeric|min:0',
            'status' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'traveler_ids' => 'nullable|array',
            'traveler_ids.*' => 'exists:travel_travelers,id',
        ]);

        if (isset($validated['total_amount']) || isset($validated['paid_amount'])) {
            $total = $validated['total_amount'] ?? $booking->total_amount;
            $paid = $validated['paid_amount'] ?? $booking->paid_amount;
            $validated['pending_amount'] = max(0, $total - $paid);
        }

        $booking->update($validated);

        if (isset($validated['traveler_ids'])) {
            $booking->travelers()->sync($validated['traveler_ids']);
        }

        return response()->json($booking->load(['client', 'package', 'destination', 'travelers']));
    }

    public function destroy(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $booking = TravelBooking::where('company_id', $companyId)->findOrFail($id);
        $booking->delete();
        return response()->json(['message' => 'Reserva eliminada']);
    }
}
