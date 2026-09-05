<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\TableQueryService;
use Illuminate\Http\Request;

class ProductController extends BaseCrudController
{
    protected string $model = Product::class;
    protected string $resource = ProductResource::class;
    protected array $searchable = ['sku', 'name', 'category'];
    protected array $filterable = ['status' => 'status', 'category' => 'category'];

    /** Igual al index generico, mas `stock_on_hand` (suma de movimientos) por fila. */
    public function index(Request $request, TableQueryService $tables)
    {
        $query = Product::query()
            ->where('company_id', $this->companyId($request))
            ->withSum('stockMovements as stock_on_hand', 'quantity');

        $tables->apply($request, $query, $this->searchable, $this->filterable);

        return ProductResource::collection($query->paginate(min((int) $request->input('per_page', 10), 100)));
    }
}
