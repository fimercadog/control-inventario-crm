<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use App\Models\AuditLog;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Property;
use App\Models\PropertyLease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertyLeaseController extends Controller
{
    public function index(Request $request)
    {
        $companyId = auth()->user()?->company_id;
        $query = PropertyLease::where('company_id', $companyId)
            ->with(['property', 'tenant']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $leases = $query->orderBy('start_date', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($leases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'client_id' => 'required|exists:clients,id',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'payment_day' => 'nullable|integer|min:1|max:31',
            'notes' => 'nullable|string',
        ]);

        $companyId = auth()->user()?->company_id;
        $contractNumber = 'CTR-' . date('Ym') . '-' . strtoupper(Str::random(4));

        $lease = DB::transaction(function () use ($validated, $companyId, $contractNumber) {
            $lease = PropertyLease::create([
                'company_id' => $companyId,
                'property_id' => $validated['property_id'],
                'client_id' => $validated['client_id'],
                'contract_number' => $contractNumber,
                'monthly_rent' => $validated['monthly_rent'],
                'deposit_amount' => $validated['deposit_amount'] ?? 0,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'payment_day' => $validated['payment_day'] ?? 5,
                'status' => 'ACTIVO',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Actualizar estado del inmueble a Arrendado
            $property = Property::find($validated['property_id']);
            if ($property) {
                $property->update(['status' => 'arrendado']);
            }

            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'action' => 'property_lease_created',
                'module' => 'leases',
                'entity' => 'PropertyLease',
                'entity_id' => $lease->id,
                'new_values' => $lease->toArray(),
            ]);

            return $lease;
        });

        return response()->json([
            'message' => 'Contrato de arrendamiento registrado exitosamente',
            'data' => $lease->load(['property', 'tenant']),
        ], 201);
    }

    public function show($id)
    {
        $companyId = auth()->user()?->company_id;
        $lease = PropertyLease::where('company_id', $companyId)
            ->with(['property', 'tenant'])
            ->findOrFail($id);

        return response()->json(['data' => $lease]);
    }

    public function update(Request $request, $id)
    {
        $companyId = auth()->user()?->company_id;
        $lease = PropertyLease::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'monthly_rent' => 'sometimes|numeric|min:0',
            'deposit_amount' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'payment_day' => 'sometimes|integer|min:1|max:31',
            'status' => 'sometimes|string|in:ACTIVO,PENDIENTE,FINALIZADO,CANCELADO',
            'notes' => 'nullable|string',
        ]);

        $lease->update($validated);

        if (isset($validated['status']) && in_array($validated['status'], ['FINALIZADO', 'CANCELADO'])) {
            $lease->property->update(['status' => 'disponible']);
        }

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => auth()->id(),
            'action' => 'property_lease_updated',
            'module' => 'leases',
            'entity' => 'PropertyLease',
            'entity_id' => $lease->id,
            'new_values' => $lease->toArray(),
        ]);

        return response()->json([
            'message' => 'Contrato de arrendamiento actualizado exitosamente',
            'data' => $lease->fresh(['property', 'tenant']),
        ]);
    }

    public function collectRent(Request $request, $id)
    {
        $companyId = auth()->user()?->company_id;
        $lease = PropertyLease::where('company_id', $companyId)
            ->with(['property', 'tenant'])
            ->findOrFail($id);

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|in:cash,transfer,card',
            'notes' => 'nullable|string',
        ]);

        $rentAmount = $validated['amount'] ?? $lease->monthly_rent;
        $paymentMethod = $validated['payment_method'] ?? 'cash';

        $invoice = DB::transaction(function () use ($lease, $rentAmount, $paymentMethod, $companyId, $validated) {
            // 1. Crear Factura en ERP
            $invoiceNumber = 'REC-' . date('Ym') . '-' . strtoupper(Str::random(4));
            $invoice = Invoice::create([
                'company_id' => $companyId,
                'client_id' => $lease->client_id,
                'number' => $invoiceNumber,
                'issue_date' => now(),
                'due_date' => now(),
                'status' => 'paid',
                'subtotal' => $rentAmount,
                'tax' => 0,
                'total' => $rentAmount,
                'notes' => "Recaudo de canon de arrendamiento contrato {$lease->contract_number}",
            ]);

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'product_name' => "Canon de Arrendamiento - {$lease->property->title}",
                'quantity' => 1,
                'unit_price' => $rentAmount,
                'line_total' => $rentAmount,
            ]);

            // 2. Crear Cuenta por Cobrar y marcarla saldada
            AccountReceivable::create([
                'company_id' => $companyId,
                'client_id' => $lease->client_id,
                'invoice_id' => $invoice->id,
                'original_amount' => $rentAmount,
                'paid_amount' => $rentAmount,
                'balance' => 0,
                'due_date' => now(),
                'status' => 'paid',
            ]);

            // 3. Registrar Ingreso en Caja Abierta del ERP
            $cashRegister = CashRegister::where('company_id', $companyId)->first();
            $cashSession = $cashRegister ? CashSession::where('cash_register_id', $cashRegister->id)->whereNull('closed_at')->first() : null;

            if ($cashSession) {
                CashMovement::create([
                    'company_id' => $companyId,
                    'cash_session_id' => $cashSession->id,
                    'user_id' => auth()->id(),
                    'type' => 'income',
                    'amount' => $rentAmount,
                    'method' => $paymentMethod,
                    'source_type' => PropertyLease::class,
                    'source_id' => $lease->id,
                    'notes' => "Recaudo canon de arriendo {$lease->contract_number} ({$lease->property->title})",
                ]);
            }

            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'action' => 'property_lease_rent_collected',
                'module' => 'leases',
                'entity' => 'PropertyLease',
                'entity_id' => $lease->id,
                'new_values' => [
                    'amount' => $rentAmount,
                    'invoice_id' => $invoice->id,
                ],
            ]);

            return $invoice;
        });

        return response()->json([
            'message' => 'Canon de arrendamiento recaudado e ingresado al ERP exitosamente',
            'data' => [
                'lease' => $lease,
                'invoice' => $invoice,
            ],
        ]);
    }
}
