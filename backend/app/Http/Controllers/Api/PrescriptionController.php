<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrescriptionRequest;
use App\Http\Resources\PrescriptionResource;
use App\Models\Consultation;
use App\Models\Prescription;
use App\Models\Product;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    use ResolvesCompany;

    private const WITH = ['patient', 'vet', 'items'];

    public function index(Request $request, TableQueryService $tables)
    {
        $query = Prescription::query()
            ->where('company_id', $this->companyId($request))
            ->with(self::WITH);

        $tables->apply($request, $query, [], ['patient_id' => 'patient_id', 'consultation_id' => 'consultation_id']);

        return PrescriptionResource::collection(
            $query->paginate(min((int) $request->input('per_page', 10), 100))
        );
    }

    public function show(Request $request, string $id)
    {
        return new PrescriptionResource($this->find($request, $id)->load(self::WITH));
    }

    public function store(StorePrescriptionRequest $request, AuditService $audit)
    {
        $data = $request->validated();
        $companyId = $this->companyId($request);

        $consultation = Consultation::query()
            ->where('company_id', $companyId)
            ->findOrFail($data['consultation_id']);

        $prescription = DB::transaction(function () use ($data, $companyId, $consultation, $request, $audit) {
            $prescription = Prescription::create([
                'company_id' => $companyId,
                'consultation_id' => $consultation->id,
                'patient_id' => $consultation->patient_id,
                'vet_id' => $data['vet_id'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = ! empty($item['product_id']) ? Product::find($item['product_id']) : null;
                $prescription->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'medication_name' => $item['medication_name'],
                    'sku' => $product?->sku,
                    'dosage' => $item['dosage'] ?? null,
                    'frequency' => $item['frequency'] ?? null,
                    'duration' => $item['duration'] ?? null,
                ]);
            }

            $audit->record('created', $prescription, $request);

            return $prescription;
        });

        return (new PrescriptionResource($prescription->load(self::WITH)))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        $prescription = $this->find($request, $id);
        $prescription->delete();
        $audit->record('deleted', $prescription, $request);

        return response()->noContent();
    }

    /** Receta imprimible. */
    public function pdf(Request $request, string $id)
    {
        $prescription = $this->find($request, $id)->load([...self::WITH, 'company', 'consultation']);

        $pdf = Pdf::loadView('prescriptions.pdf', ['p' => $prescription]);

        return $pdf->download('receta-'.$prescription->id.'.pdf');
    }

    private function find(Request $request, string $id): Prescription
    {
        return Prescription::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);
    }
}
