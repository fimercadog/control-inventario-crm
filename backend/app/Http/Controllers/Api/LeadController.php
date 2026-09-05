<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * No extiende BaseCrudController: `store` es publico (formulario de
 * marketing, sin usuario autenticado) y necesita reglas distintas
 * (consentimiento, ip, status forzado) al alta hecha desde el panel.
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

    /** Panel: solo cambia el estado del lead. */
    public function update(Request $request, Lead $lead, AuditService $audit)
    {
        abort_unless($lead->company_id === $this->companyId($request), 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(['new', 'contacted', 'discarded'])],
        ]);

        $oldValues = $lead->getOriginal();
        $lead->update($data);
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
