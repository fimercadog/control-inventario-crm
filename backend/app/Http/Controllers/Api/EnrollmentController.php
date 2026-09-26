<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Team;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = Enrollment::where('company_id', $companyId)
            ->with(['student.client', 'team'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->integer('team_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'monthly_fee' => ['nullable', 'numeric', 'min:0'],
            'enrollment_fee' => ['nullable', 'numeric', 'min:0'],
            'billing_day' => ['nullable', 'integer', 'min:1', 'max:28'],
            'start_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $student = Student::where('company_id', $companyId)->findOrFail($data['student_id']);
        $team = Team::where('company_id', $companyId)->findOrFail($data['team_id']);

        $monthlyFee = $data['monthly_fee'] ?? $team->monthly_fee;
        $enrollmentFee = $data['enrollment_fee'] ?? 0;
        $billingDay = $data['billing_day'] ?? 5;
        $startDate = Carbon::parse($data['start_date']);
        $enrollmentNum = 'INS-'.strtoupper(Str::random(6));

        $enrollment = DB::transaction(function () use ($companyId, $student, $team, $enrollmentNum, $monthlyFee, $enrollmentFee, $billingDay, $startDate, $data) {
            $enrollment = Enrollment::create([
                'company_id' => $companyId,
                'student_id' => $student->id,
                'team_id' => $team->id,
                'enrollment_number' => $enrollmentNum,
                'monthly_fee' => $monthlyFee,
                'enrollment_fee' => $enrollmentFee,
                'billing_day' => $billingDay,
                'start_date' => $startDate,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
            ]);

            // Assign student to team if not assigned
            $student->update(['team_id' => $team->id]);

            // Generate initial Invoice and Account Receivable for enrollment + first month fee
            $totalAmount = $monthlyFee + $enrollmentFee;
            if ($totalAmount > 0) {
                $invoice = \App\Models\Invoice::create([
                    'company_id' => $companyId,
                    'client_id' => $student->client_id,
                    'number' => 'FAC-INS-'.strtoupper(Str::random(5)),
                    'status' => 'posted',
                    'issue_date' => $startDate->toDateString(),
                    'due_date' => $startDate->copy()->addDays(5)->toDateString(),
                    'subtotal' => $totalAmount,
                    'tax' => 0,
                    'total' => $totalAmount,
                ]);

                \App\Models\InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_name' => "Inscripción y Mensualidad Cantera Real - Alumno: {$student->first_name} {$student->last_name}",
                    'quantity' => 1,
                    'unit_price' => $totalAmount,
                    'discount' => 0,
                    'tax' => 0,
                    'line_total' => $totalAmount,
                ]);

                AccountReceivable::create([
                    'company_id' => $companyId,
                    'client_id' => $student->client_id,
                    'invoice_id' => $invoice->id,
                    'original_amount' => $totalAmount,
                    'paid_amount' => 0,
                    'balance' => $totalAmount,
                    'due_date' => $invoice->due_date,
                    'status' => 'pending',
                ]);
            }

            return $enrollment;
        });

        $audit->record('created', $enrollment, $request);

        return response()->json([
            'message' => 'Inscripción registrada con éxito y generada la cuenta por cobrar en cartera ERP.',
            'data' => $enrollment->load(['student.client', 'team']),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $enrollment = Enrollment::where('company_id', $companyId)
            ->with(['student.client', 'team'])
            ->findOrFail($id);

        return response()->json(['data' => $enrollment]);
    }

    public function update(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $enrollment = Enrollment::where('company_id', $companyId)->findOrFail($id);

        $data = $request->validate([
            'monthly_fee' => ['sometimes', 'numeric', 'min:0'],
            'enrollment_fee' => ['sometimes', 'numeric', 'min:0'],
            'billing_day' => ['sometimes', 'integer', 'min:1', 'max:28'],
            'status' => ['sometimes', 'string', 'in:active,paused,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $oldValues = $enrollment->getAttributes();
        $enrollment->update($data);
        $audit->record('updated', $enrollment, $request, $oldValues);

        return response()->json(['message' => 'Inscripción actualizada con éxito.', 'data' => $enrollment->load(['student.client', 'team'])]);
    }

    public function destroy(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $enrollment = Enrollment::where('company_id', $companyId)->findOrFail($id);

        $oldValues = $enrollment->getAttributes();
        $enrollment->delete();
        $audit->record('deleted', $enrollment, $request, $oldValues);

        return response()->json(['message' => 'Inscripción eliminada con éxito.']);
    }
}
