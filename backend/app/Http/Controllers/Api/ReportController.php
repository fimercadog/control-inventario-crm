<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    use ResolvesCompany;

    public function __invoke(Request $request)
    {
        $companyId = $this->companyId($request);
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();

        $deals = fn () => Deal::where('company_id', $companyId);
        $products = fn () => Product::where('company_id', $companyId)->withSum('stockMovements as stock_on_hand', 'quantity');

        return response()->json([
            'generated_at' => now(),
            'pipeline' => [
                'total_deals' => $deals()->count(),
                'open_value' => (float) $deals()->whereNotIn('stage', ['won', 'lost'])->sum('amount'),
                'won_month' => $deals()->where('stage', 'won')->whereBetween('updated_at', [$monthStart, $today])->count(),
                'lost_month' => $deals()->where('stage', 'lost')->whereBetween('updated_at', [$monthStart, $today])->count(),
                'by_stage' => $deals()->selectRaw('stage, count(*) as total, coalesce(sum(amount), 0) as amount')->groupBy('stage')->get(),
            ],
            'clients' => [
                'total' => Client::where('company_id', $companyId)->count(),
                'active' => Client::where('company_id', $companyId)->where('status', 'active')->count(),
            ],
            'sales' => [
                'orders_month' => Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $today])->count(),
                'revenue_month' => (float) Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $today])->sum('total'),
                'draft_orders' => Order::where('company_id', $companyId)->where('status', 'draft')->count(),
            ],
            'inventory' => [
                'total_products' => $products()->count(),
                'low_stock' => $products()->get()->filter(fn (Product $p) => (int) ($p->stock_on_hand ?? 0) < $p->reorder_level)->count(),
                'pending_purchase_orders' => PurchaseOrder::where('company_id', $companyId)->whereIn('status', ['draft', 'ordered'])->count(),
            ],
            'top_products_by_stock' => $products()->orderByDesc('stock_on_hand')->limit(10)->get(['id', 'name', 'sku'])
                ->map(fn (Product $p) => ['name' => $p->name, 'sku' => $p->sku, 'stock_on_hand' => (int) ($p->stock_on_hand ?? 0)]),
        ]);
    }
}
