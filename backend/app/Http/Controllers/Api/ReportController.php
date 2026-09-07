<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Quote;
use App\Models\User;
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
        $monthEnd = $today->copy()->endOfDay();

        $deals = fn () => Deal::where('company_id', $companyId);
        $products = fn () => Product::where('company_id', $companyId)->withSum('stockMovements as stock_on_hand', 'quantity');

        return response()->json([
            'generated_at' => now(),
            'pipeline' => [
                'total_deals' => $deals()->count(),
                'open_value' => (float) $deals()->whereNotIn('stage', ['won', 'lost'])->sum('amount'),
                'won_month' => $deals()->where('stage', 'won')->whereBetween('updated_at', [$monthStart, $monthEnd])->count(),
                'lost_month' => $deals()->where('stage', 'lost')->whereBetween('updated_at', [$monthStart, $monthEnd])->count(),
                'by_stage' => $deals()->selectRaw('stage, count(*) as total, coalesce(sum(amount), 0) as amount')->groupBy('stage')->get(),
            ],
            'clients' => [
                'total' => Client::where('company_id', $companyId)->count(),
                'active' => Client::where('company_id', $companyId)->where('status', 'active')->count(),
            ],
            'sales' => [
                'orders_month' => Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $monthEnd])->count(),
                'revenue_month' => (float) Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $monthEnd])->sum('total'),
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

    /** Reportes comerciales: embudo/conversion, ventas por vendedor, cotizaciones, ventas por producto. */
    public function commercial(Request $request)
    {
        $companyId = $this->companyId($request);
        $monthStart = Carbon::today()->startOfMonth();

        $stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won'];
        $byStage = Deal::where('company_id', $companyId)
            ->selectRaw('stage, count(*) as total')
            ->groupBy('stage')->pluck('total', 'stage');

        $funnel = [];
        $prev = null;
        foreach ($stages as $stage) {
            $count = (int) ($byStage[$stage] ?? 0);
            $funnel[] = [
                'stage' => $stage,
                'count' => $count,
                // Conversion contra la etapa inmediatamente anterior; null si esa
                // etapa esta vacia (no se salta a una etapa mas atras).
                'conversion_from_prev' => $prev > 0 ? round($count / $prev * 100, 1) : null,
            ];
            $prev = $count;
        }
        $won = (int) ($byStage['won'] ?? 0);
        $lost = Deal::where('company_id', $companyId)->where('stage', 'lost')->count();
        $winRate = ($won + $lost) > 0 ? round($won / ($won + $lost) * 100, 1) : null;

        // Dos agregados agrupados por owner en vez de ~4 consultas por usuario.
        $dealsByOwner = Deal::where('company_id', $companyId)
            ->whereNotNull('owner_id')
            ->selectRaw("owner_id,
                sum(case when stage not in ('won', 'lost') then 1 else 0 end) as open_deals,
                sum(case when stage = 'won' then 1 else 0 end) as won_deals,
                coalesce(sum(case when stage = 'won' then amount else 0 end), 0) as won_value")
            ->groupBy('owner_id')->get()->keyBy('owner_id');

        $revenueByOwner = Order::where('company_id', $companyId)
            ->where('status', 'confirmed')
            ->where('updated_at', '>=', $monthStart)
            ->whereNotNull('owner_id')
            ->selectRaw('owner_id, coalesce(sum(total), 0) as revenue_month')
            ->groupBy('owner_id')->pluck('revenue_month', 'owner_id');

        $byOwner = User::where('company_id', $companyId)->orderBy('name')->get()->map(function (User $u) use ($dealsByOwner, $revenueByOwner) {
            $d = $dealsByOwner->get($u->id);

            return [
                'owner' => $u->name,
                'open_deals' => (int) ($d->open_deals ?? 0),
                'won_deals' => (int) ($d->won_deals ?? 0),
                'won_value' => (float) ($d->won_value ?? 0),
                'revenue_month' => (float) ($revenueByOwner[$u->id] ?? 0),
            ];
        })->filter(fn ($r) => $r['open_deals'] || $r['won_deals'] || $r['revenue_month'] > 0)->values();

        $quoteCounts = Quote::where('company_id', $companyId)
            ->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $sent = (int) ($quoteCounts['sent'] ?? 0) + (int) ($quoteCounts['accepted'] ?? 0) + (int) ($quoteCounts['rejected'] ?? 0);
        $accepted = (int) ($quoteCounts['accepted'] ?? 0);

        $salesByProduct = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.company_id', $companyId)
            ->where('orders.status', 'confirmed')
            ->selectRaw('products.name, sum(order_items.quantity) as units, sum(order_items.quantity * order_items.unit_price) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'units' => (int) $r->units, 'revenue' => (float) $r->revenue]);

        return response()->json([
            'generated_at' => now(),
            'funnel' => $funnel,
            'win_rate' => $winRate,
            'by_owner' => $byOwner,
            'quotes' => [
                'draft' => (int) ($quoteCounts['draft'] ?? 0),
                'sent' => $sent,
                'accepted' => $accepted,
                'rejected' => (int) ($quoteCounts['rejected'] ?? 0),
                'acceptance_rate' => $sent > 0 ? round($accepted / $sent * 100, 1) : null,
            ],
            'sales_by_product' => $salesByProduct,
        ]);
    }
}
