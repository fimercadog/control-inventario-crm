<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = Attendance::where('company_id', $companyId)
            ->with(['student', 'team'])
            ->orderBy('date', 'desc');

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->integer('team_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->string('date'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validate([
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'date' => ['required', 'date'],
            'attendances' => ['required', 'array'],
            'attendances.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'attendances.*.status' => ['required', 'string', 'in:present,absent,excused,late'],
            'attendances.*.notes' => ['nullable', 'string'],
        ]);

        $date = Carbon::parse($data['date'])->toDateString();
        $records = [];

        foreach ($data['attendances'] as $item) {
            $record = Attendance::updateOrCreate(
                [
                    'company_id' => $companyId,
                    'student_id' => $item['student_id'],
                    'date' => $date,
                ],
                [
                    'team_id' => $data['team_id'],
                    'status' => $item['status'],
                    'notes' => $item['notes'] ?? null,
                ]
            );
            $records[] = $record;
        }

        return response()->json([
            'message' => 'Asistencia registrada con éxito.',
            'count' => count($records),
        ]);
    }
}
