<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StockMovementResource;
use App\Models\StockMovement;

/**
 * Solo index/store: un movimiento de stock es un asiento de bitacora, no se
 * edita ni se borra (el signo de `quantity` ya codifica in/out, ver
 * StoreStockMovementRequest::passedValidation).
 */
class StockMovementController extends BaseCrudController
{
    protected string $model = StockMovement::class;

    protected string $resource = StockMovementResource::class;

    protected array $with = ['product', 'warehouse'];

    protected array $searchable = ['reason', 'reference'];

    protected array $filterable = ['type' => 'type', 'product_id' => 'product_id', 'warehouse_id' => 'warehouse_id'];
}
