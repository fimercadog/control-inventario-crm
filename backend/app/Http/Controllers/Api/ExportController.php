<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    use ResolvesCompany;

    private array $map = [
        'clients' => [Client::class, ['name', 'company_name', 'email', 'phone', 'status']],
        'deals' => [Deal::class, ['client_id', 'title', 'amount', 'stage', 'expected_close_date']],
        'products' => [Product::class, ['sku', 'name', 'unit_price', 'cost_price', 'reorder_level', 'status']],
        'suppliers' => [Supplier::class, ['name', 'contact_name', 'email', 'phone', 'status']],
        'purchase-orders' => [PurchaseOrder::class, ['supplier_id', 'warehouse_id', 'status', 'order_date', 'total']],
        'orders' => [Order::class, ['client_id', 'warehouse_id', 'status', 'total']],
        'audit-logs' => [AuditLog::class, ['user_id', 'action', 'module', 'entity', 'entity_id', 'created_at']],
    ];

    private array $permissionByResource = [
        'clients' => 'clients.manage',
        'deals' => 'deals.manage',
        'products' => 'products.manage',
        'suppliers' => 'suppliers.manage',
        'purchase-orders' => 'purchase_orders.manage',
        'orders' => 'orders.manage',
        'audit-logs' => 'audit.view',
    ];

    public function __invoke(Request $request, string $resource, string $format, TableQueryService $tables)
    {
        abort_unless($request->user()->can($this->permissionByResource[$resource]), 403);

        [$model, $columns] = $this->map[$resource];
        $query = $model::query()->where('company_id', $this->companyId($request));
        $tables->apply($request, $query, $columns, ['status' => 'status']);
        $rows = $query->limit(5000)->get($columns);

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.table', compact('resource', 'columns', 'rows'));
            return $pdf->download($resource.'.pdf');
        }

        $callback = function () use ($columns, $rows): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);
            foreach ($rows as $row) {
                fputcsv($handle, collect($columns)->map(fn ($column) => $row->{$column})->all());
            }
            fclose($handle);
        };

        return response()->streamDownload($callback, $resource.'.csv', ['Content-Type' => 'text/csv']);
    }
}
