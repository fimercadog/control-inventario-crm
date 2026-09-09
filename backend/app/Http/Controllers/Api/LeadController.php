<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeadPanelRequest;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Services\AuditService;
use Illuminate\Http\Request;

/**
 * No extiende BaseCrudController: `store` es publico (formulario de marketing,
 * sin usuario autenticado) y necesita reglas distintas — consentimiento Ley
 * 1581, ip, status forzado — al alta manual desde el panel (`storeManual`).
 */
class LeadController extends Controller
{
    use ResolvesCompany;

    /** Publico: lo llaman los formularios del sitio de marketing. Throttle en la ruta. */
    public function store(StoreLeadRequest $request)
    {
        Lead::create($request->safe()->except('consent') + [
            'company_id' => $this->companyId($request),
            'status' => 'new',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Recibimos tu solicitud. Te contactaremos pronto.',
        ], 201);
    }

    /** Panel: alta manual de un lead que llego por telefono / en persona. Origen "manual". */
    public function storeManual(LeadPanelRequest $request, AuditService $audit)
    {
        $lead = Lead::create($request->validated() + [
            'company_id' => $this->companyId($request),
            'source' => 'manual',
        ]);

        $audit->record('created', $lead, $request);

        return (new LeadResource($lead))->response()->setStatusCode(201);
    }

    /** Panel: gated por can:leads.view en la ruta. */
    public function index(Request $request)
    {
        $leads = Lead::query()
            ->where('company_id', $this->companyId($request))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('source'), fn ($q) => $q->where('source', $request->string('source')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($sub) => $sub->where('name', 'like', $term)->orWhere('email', 'like', $term)->orWhere('company_name', 'like', $term));
            })
            ->latest()
            ->paginate(min($request->integer('per_page', 10), 100));

        return LeadResource::collection($leads);
    }

    /** Panel: corrige datos del lead y/o su estado de seguimiento. */
    public function update(LeadPanelRequest $request, Lead $lead, AuditService $audit)
    {
        abort_unless($lead->company_id === $this->companyId($request), 404);

        $oldValues = $lead->getOriginal();
        $lead->update($request->validated());
        $audit->record('updated', $lead, $request, $oldValues);

        return new LeadResource($lead);
    }

    public function destroy(Request $request, Lead $lead, AuditService $audit)
    {
        abort_unless($lead->company_id === $this->companyId($request), 404);

        $audit->record('deleted', $lead, $request, $lead->getOriginal());
        $lead->delete();

        return response()->noContent();
    }
}
