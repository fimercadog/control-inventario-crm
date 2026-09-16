<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\AuditService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends BaseCrudController
{
    protected string $model = Payment::class;

    protected string $resource = PaymentResource::class;

    protected array $with = ['cashMovement'];

    protected array $filterable = ['direction' => 'direction', 'cash_session_id' => 'cash_session_id'];

    public function store(Request $request, AuditService $audit)
    {
        $service = app(PaymentService::class);
        $data = $request->validate([
            'target_type' => ['required', 'in:receivable,payable'],
            'target_id' => ['required', 'integer'],
            'paid_at' => ['nullable', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'cash_session_id' => ['nullable', Rule::exists('cash_sessions', 'id')->where('company_id', $this->companyId($request))],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
        ]);

        $payment = $service->register($data, $this->companyId($request), $request->user()->id);
        $audit->record('payment.registered', $payment, $request);

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Los pagos no se editan.');
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Los pagos no se eliminan.');
    }
}
