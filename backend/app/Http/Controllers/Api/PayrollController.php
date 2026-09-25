<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountPayable;
use App\Models\AuditLog;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Payroll;
use App\Models\PayrollDetail;
use App\Services\PayrollCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $companyId = auth()->user()?->company_id;
        $query = Payroll::where('company_id', $companyId)->withCount('details');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payrolls = $query->orderBy('period_start', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($payrolls);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'payroll_type' => 'nullable|string|in:mensual,quincenal',
            'notes' => 'nullable|string',
        ]);

        $companyId = auth()->user()?->company_id;

        // Validar que no exista un período duplicado para las mismas fechas
        $exists = Payroll::where('company_id', $companyId)
            ->where('period_start', $validated['period_start'])
            ->where('period_end', $validated['period_end'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya existe un período de nómina registrado para estas fechas.'], 422);
        }

        $code = 'NOM-' . date('Ym', strtotime($validated['period_start'])) . '-' . strtoupper(Str::random(4));

        $payroll = Payroll::create([
            'company_id' => $companyId,
            'payroll_code' => $code,
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'payroll_type' => $validated['payroll_type'] ?? 'mensual',
            'status' => 'BORRADOR',
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => auth()->id(),
            'action' => 'payroll_period_created',
            'module' => 'payrolls',
            'entity' => 'Payroll',
            'entity_id' => $payroll->id,
            'new_values' => $payroll->toArray(),
        ]);

        return response()->json([
            'message' => 'Período de nómina creado exitosamente',
            'data' => $payroll
        ], 201);
    }

    public function show($id)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)
            ->with(['details.employee.position', 'details.employee.department', 'approvedBy', 'details.accountPayable'])
            ->findOrFail($id);

        return response()->json(['data' => $payroll]);
    }

    public function calculate(Request $request, $id, PayrollCalculationService $service)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)->findOrFail($id);

        if (in_array($payroll->status, ['APROBADA', 'PAGADA', 'CERRADA'])) {
            return response()->json(['message' => 'Una nómina aprobada o cerrada no puede ser recalculada.'], 422);
        }

        $employeeIds = $request->input('employee_ids', []);
        $customAdjustments = $request->input('adjustments', []);

        $updatedPayroll = $service->calculate($payroll, $employeeIds, $customAdjustments);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => auth()->id(),
            'action' => 'payroll_calculated',
            'module' => 'payrolls',
            'entity' => 'Payroll',
            'entity_id' => $updatedPayroll->id,
            'new_values' => [
                'total_accrued' => $updatedPayroll->total_accrued,
                'total_deductions' => $updatedPayroll->total_deductions,
                'total_net' => $updatedPayroll->total_net,
                'employees_count' => $updatedPayroll->details->count(),
            ],
        ]);

        return response()->json([
            'message' => 'Nómina calculada exitosamente',
            'data' => $updatedPayroll
        ]);
    }

    public function approve($id)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)->with('details')->findOrFail($id);

        if ($payroll->status !== 'CALCULADA') {
            return response()->json(['message' => 'Solo una nómina en estado CALCULADA puede ser aprobada.'], 422);
        }

        if ($payroll->details->isEmpty()) {
            return response()->json(['message' => 'No se puede aprobar una nómina sin empleados calculados.'], 422);
        }

        DB::transaction(function () use ($payroll, $companyId) {
            foreach ($payroll->details as $detail) {
                // Crear obligación en Cuentas por Pagar (CXP) para cada empleado
                $ap = AccountPayable::create([
                    'company_id' => $companyId,
                    'original_amount' => $detail->net_payable,
                    'paid_amount' => 0,
                    'balance' => $detail->net_payable,
                    'due_date' => $payroll->period_end,
                    'status' => 'pending',
                ]);

                $detail->update([
                    'account_payable_id' => $ap->id,
                ]);
            }

            $payroll->update([
                'status' => 'APROBADA',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'action' => 'payroll_approved',
                'module' => 'payrolls',
                'entity' => 'Payroll',
                'entity_id' => $payroll->id,
                'new_values' => [
                    'approved_by' => auth()->id(),
                    'accounts_payable_created' => $payroll->details->count(),
                ],
            ]);
        });

        return response()->json([
            'message' => 'Nómina aprobada exitosamente y Cuentas por Pagar (CXP) generadas.',
            'data' => $payroll->fresh(['details.accountPayable'])
        ]);
    }

    public function pay(Request $request, $id)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)->with('details.accountPayable')->findOrFail($id);

        if ($payroll->status !== 'APROBADA') {
            return response()->json(['message' => 'Solo una nómina en estado APROBADA puede ser pagada.'], 422);
        }

        DB::transaction(function () use ($payroll, $companyId, $request) {
            // Buscar sesión de caja activa o primera registradora para abonar el egreso
            $cashRegister = CashRegister::where('company_id', $companyId)->first();
            $cashSession = $cashRegister ? CashSession::where('cash_register_id', $cashRegister->id)->whereNull('closed_at')->first() : null;

            foreach ($payroll->details as $detail) {
                if ($detail->accountPayable) {
                    $ap = $detail->accountPayable;
                    $ap->update([
                        'paid_amount' => $ap->original_amount,
                        'balance' => 0,
                        'status' => 'paid',
                    ]);
                }

                $detail->update(['status' => 'pagado']);

                if ($cashSession) {
                    CashMovement::create([
                        'company_id' => $companyId,
                        'cash_session_id' => $cashSession->id,
                        'user_id' => auth()->id(),
                        'type' => 'expense',
                        'amount' => $detail->net_payable,
                        'source_type' => PayrollDetail::class,
                        'source_id' => $detail->id,
                        'notes' => "Pago de nómina {$payroll->payroll_code} a empleado #{$detail->employee_id}",
                    ]);
                }
            }

            $payroll->update([
                'status' => 'PAGADA',
                'paid_at' => now(),
            ]);

            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'action' => 'payroll_paid',
                'module' => 'payrolls',
                'entity' => 'Payroll',
                'entity_id' => $payroll->id,
                'new_values' => ['paid_at' => now()],
            ]);
        });

        return response()->json([
            'message' => 'Nómina pagada exitosamente. CXP liquidadas y egresos de caja registrados.',
            'data' => $payroll->fresh('details')
        ]);
    }

    public function close($id)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)->findOrFail($id);

        if (!in_array($payroll->status, ['APROBADA', 'PAGADA'])) {
            return response()->json(['message' => 'Solo nóminas aprobadas o pagadas pueden ser cerradas.'], 422);
        }

        $payroll->update(['status' => 'CERRADA']);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => auth()->id(),
            'action' => 'payroll_closed',
            'module' => 'payrolls',
            'entity' => 'Payroll',
            'entity_id' => $payroll->id,
        ]);

        return response()->json(['message' => 'Período de nómina cerrado definitivamente.', 'data' => $payroll]);
    }

    public function receipt($id, $detailId)
    {
        $companyId = auth()->user()?->company_id;
        $payroll = Payroll::where('company_id', $companyId)->findOrFail($id);
        $detail = PayrollDetail::where('payroll_id', $payroll->id)
            ->with(['employee.position', 'employee.department'])
            ->findOrFail($detailId);

        return response()->json([
            'company' => auth()->user()?->company,
            'payroll' => $payroll,
            'detail' => $detail,
            'employee' => $detail->employee,
            'concepts' => $detail->concepts_json,
        ]);
    }
}
