<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Resources\StockTransferResource;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Solo index/store: una transferencia es un asiento. Al crearse valida stock
 * disponible en la bodega origen y genera dos StockMovement (salida en origen,
 * entrada en destino) en una transaccion.
 */
class StockTransferController extends BaseCrudController
{
    protected string $model = StockTransfer::class;
    protected string $resource = StockTransferResource::class;
    protected array $with = ['product', 'fromWarehouse', 'toWarehouse'];
    protected array $searchable = ['reference', 'notes'];
    protected array $filterable = ['product_id' => 'product_id', 'from_warehouse_id' => 'from_warehouse_id', 'to_warehouse_id' => 'to_warehouse_id'];

    public function store(Request $request, AuditService $audit)
    {
        $data = app(StoreStockTransferRequest::class)->validated();
        $companyId = $this->companyId($request);

        $product = Product::where('company_id', $companyId)->findOrFail($data['product_id']);
        if ($product->stockOnHand($data['from_warehouse_id']) < $data['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => 'Sin existencias suficientes en la bodega de origen.',
            ]);
        }

        $transfer = DB::transaction(function () use ($data, $companyId, $product) {
            $transfer = StockTransfer::create($data + ['company_id' => $companyId, 'status' => 'completed']);

            foreach ([
                ['warehouse_id' => $data['from_warehouse_id'], 'quantity' => -$data['quantity']],
                ['warehouse_id' => $data['to_warehouse_id'], 'quantity' => $data['quantity']],
            ] as $leg) {
                StockMovement::create([
                    'company_id' => $companyId,
                    'product_id' => $product->id,
                    'warehouse_id' => $leg['warehouse_id'],
                    'type' => 'adjustment',
                    'quantity' => $leg['quantity'],
                    'reason' => 'Transferencia entre bodegas',
                    'reference' => 'transfer:'.$transfer->id,
                ]);
            }

            return $transfer;
        });

        $transfer->load($this->with);
        $audit->record('created', $transfer, $request);

        return (new StockTransferResource($transfer))->response()->setStatusCode(201);
    }
}
