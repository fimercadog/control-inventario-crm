<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ClinicalApplicationResource;
use App\Models\ClinicalApplication;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClinicalApplicationController extends BaseCrudController
{
    protected string $model = ClinicalApplication::class;

    protected string $resource = ClinicalApplicationResource::class;

    protected array $with = ['patient', 'product', 'vet'];

    protected array $searchable = ['name', 'lot'];

    protected array $filterable = ['type' => 'type', 'patient_id' => 'patient_id'];

    public function index(Request $request, TableQueryService $tables)
    {
        $request->merge([
            'date_field' => 'applied_at',
            'sort' => $request->input('sort', 'applied_at'),
            'direction' => $request->input('direction', 'desc'),
        ]);

        return parent::index($request, $tables);
    }

    /**
     * Si viene `product_id`, la aplicación descuenta stock (movimiento "out") y
     * guarda `stock_movement_id`. Un soft-delete posterior NO revierte el
     * movimiento (se corrige con un ajuste manual — ver docs/roadmap-veterinaria.md S7).
     */
    public function store(Request $request, AuditService $audit)
    {
        return DB::transaction(function () use ($request, $audit) {
            $response = parent::store($request, $audit);

            $productId = $request->input('product_id');
            if (! $productId) {
                return $response;
            }

            $applicationId = $response->getData(true)['data']['id'];
            $application = ClinicalApplication::query()
                ->where('company_id', $this->companyId($request))
                ->findOrFail($applicationId);

            $quantity = (int) ($request->input('quantity') ?: 1);
            $warehouseId = (int) $request->input('warehouse_id');

            // Mismo contrato que OrderController@confirm: no dejar el stock en
            // negativo. La app clínica ya se creó dentro de la transacción, así
            // que un 422 acá revierte también ese insert.
            $product = Product::query()
                ->where('company_id', $application->company_id)
                ->findOrFail((int) $productId);

            abort_if(
                $product->stockOnHand($warehouseId) < $quantity,
                422,
                "Sin existencias suficientes de {$product->name} en esa bodega.",
            );

            $movement = StockMovement::create([
                'company_id' => $application->company_id,
                'product_id' => (int) $productId,
                'warehouse_id' => $warehouseId,
                'type' => 'out',
                'quantity' => -$quantity,
                'reason' => 'Aplicación clínica',
                'reference' => 'clinical_application:'.$application->id,
            ]);

            $application->update(['stock_movement_id' => $movement->id]);
            $audit->record('updated', $application, $request);

            return (new ClinicalApplicationResource($application->load($this->with)))
                ->response()->setStatusCode(201);
        });
    }

    public function restore(Request $request, string $id, AuditService $audit)
    {
        $application = ClinicalApplication::onlyTrashed()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $application->restore();
        $audit->record('restored', $application, $request);

        return new ClinicalApplicationResource($application->load($this->with));
    }

    /** Próximas vacunas/desparasitaciones por vencer (patrón StockAlertController). */
    public function due(Request $request, TableQueryService $tables)
    {
        $withinDays = (int) ($request->input('within_days', 30));

        $query = ClinicalApplication::query()
            ->where('company_id', $this->companyId($request))
            ->whereNotNull('next_due_at')
            ->whereDate('next_due_at', '<=', now()->addDays($withinDays))
            ->with($this->with);

        $tables->apply($request, $query, $this->searchable, ['type' => 'type']);

        return ClinicalApplicationResource::collection(
            $query->reorder()->orderBy('next_due_at')
                ->paginate(min((int) $request->input('per_page', 10), 100))
        );
    }
}
