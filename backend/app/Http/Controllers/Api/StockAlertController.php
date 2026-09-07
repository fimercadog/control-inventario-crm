<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\TableQueryService;
use Illuminate\Http\Request;

/**
 * Vista de solo lectura: productos activos cuya existencia esta por debajo del
 * punto de reorden (o agotados, o muy por encima). El stock se calcula como la
 * suma de movimientos por producto (no hay tabla de stock aparte).
 *
 * ?level = attention (por defecto: agotado + bajo) | out | low | over | all
 */
class StockAlertController extends Controller
{
    use ResolvesCompany;

    public function __invoke(Request $request, TableQueryService $tables)
    {
        abort_unless($request->user()->can('products.manage'), 403);

        $stock = '(select coalesce(sum(quantity), 0) from stock_movements where stock_movements.product_id = products.id)';

        $query = Product::query()
            ->where('company_id', $this->companyId($request))
            ->where('status', 'active')
            ->with(['category', 'brand', 'unit'])
            ->withSum('stockMovements as stock_on_hand', 'quantity');

        match ($request->input('level', 'attention')) {
            'out' => $query->whereRaw("$stock <= 0"),
            'low' => $query->whereRaw("$stock > 0 and $stock < reorder_level"),
            // ponytail: umbral de sobrestock fijo en 3x el reorden; parametrizar si el negocio lo pide.
            'over' => $query->whereRaw("reorder_level > 0 and $stock > reorder_level * 3"),
            'all' => $query,
            default => $query->whereRaw("$stock <= reorder_level"),
        };

        $tables->apply($request, $query, ['sku', 'name'], []);

        // Esta vista es "lo mas critico primero": el stock manda como orden
        // principal, por encima del created_at que agrega TableQueryService.
        return ProductResource::collection(
            $query->reorder()->orderByRaw("$stock asc")->orderBy('name')
                ->paginate(min((int) $request->input('per_page', 10), 100))
        );
    }
}
