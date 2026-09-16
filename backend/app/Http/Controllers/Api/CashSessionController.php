<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CashSessionResource;
use App\Models\CashSession;
use App\Services\AuditService;
use App\Services\CashService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CashSessionController extends BaseCrudController
{
    protected string $model = CashSession::class;

    protected string $resource = CashSessionResource::class;

    protected array $with = ['register', 'movements'];

    protected array $filterable = ['status' => 'status', 'cash_register_id' => 'cash_register_id'];

    public function store(Request $request, AuditService $audit)
    {
        $service = app(CashService::class);
        $data = $request->validate([
            'cash_register_id' => ['required', Rule::exists('cash_registers', 'id')->where('company_id', $this->companyId($request))],
            'opening_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
        ]);

        $session = $service->open($data, $this->companyId($request), $request->user()->id);
        $audit->record('cash_session.opened', $session, $request);

        return (new CashSessionResource($session))->response()->setStatusCode(201);
    }

    public function close(Request $request, CashSession $cash_session, AuditService $audit, CashService $service)
    {
        abort_unless($cash_session->company_id === $this->companyId($request), 404);
        $data = $request->validate([
            'closing_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $session = $service->close($cash_session, (float) $data['closing_amount'], $request->user()->id, $data['notes'] ?? null);
        $audit->record('cash_session.closed', $session, $request);

        return new CashSessionResource($session);
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Las sesiones de caja se abren y cierran; no se editan.');
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Las sesiones de caja no se eliminan.');
    }
}
