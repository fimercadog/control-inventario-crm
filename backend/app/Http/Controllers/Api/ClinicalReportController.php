<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ClinicalApplication;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Reportes clínicos de solo lectura. Rango por `from` / `to` (por defecto, el
 * mes en curso).
 */
class ClinicalReportController extends Controller
{
    use ResolvesCompany;

    public function __invoke(Request $request)
    {
        $companyId = $this->companyId($request);

        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : Carbon::today()->startOfMonth();
        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : Carbon::today()->endOfDay();

        $consultations = Consultation::where('company_id', $companyId)
            ->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);

        $applications = ClinicalApplication::where('company_id', $companyId)
            ->whereDate('applied_at', '>=', $from)->whereDate('applied_at', '<=', $to);

        $appointments = Appointment::where('appointments.company_id', $companyId)
            ->whereBetween('appointments.starts_at', [$from, $to]);

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'patients_attended' => (clone $consultations)->distinct()->count('patient_id'),
            'consultations' => (clone $consultations)->count(),
            'vaccinations_applied' => (clone $applications)->where('type', 'vaccine')->count(),
            'dewormings_applied' => (clone $applications)->where('type', 'deworming')->count(),
            'appointments_by_status' => (clone $appointments)
                ->selectRaw('appointments.status as status, count(*) as total')->groupBy('appointments.status')->pluck('total', 'status'),
            'appointments_by_practitioner' => (clone $appointments)
                ->join('users', 'users.id', '=', 'appointments.practitioner_id')
                ->selectRaw('users.name as practitioner, count(*) as total')
                ->groupBy('users.name')->pluck('total', 'practitioner'),
            'revenue_by_service' => (clone $appointments)
                ->where('appointments.status', 'attended')
                ->join('services', 'services.id', '=', 'appointments.service_id')
                ->selectRaw('services.name as service, coalesce(sum(services.price), 0) as revenue')
                ->groupBy('services.name')->pluck('revenue', 'service'),
        ]);
    }
}
