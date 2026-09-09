<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ResolvesCompany;

    public function __invoke(Request $request)
    {
        $companyId = $this->companyId($request);
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        // Ventanas moviles de 30 dias para los deltas "vs periodo anterior":
        // siempre tienen datos, a diferencia del mes calendario recien empezado.
        $win1Start = $today->copy()->subDays(30);
        $win2Start = $today->copy()->subDays(60);
        $rangeStart = $today->copy()->subMonths(11)->startOfMonth();

        $openDeals = Deal::where('company_id', $companyId)->whereNotIn('stage', ['won', 'lost']);
        $lowStockCount = $this->lowStockProductIds($companyId)->count();

        return response()->json([
            'generated_at' => now()->toIso8601String(),
            'metrics' => [
                'total_clients' => Client::where('company_id', $companyId)->count(),
                'open_deals' => (clone $openDeals)->count(),
                'open_deals_value' => (float) (clone $openDeals)->sum('amount'),
                'deals_won_month' => Deal::where('company_id', $companyId)->where('stage', 'won')->whereBetween('updated_at', [$monthStart, $today->copy()->endOfDay()])->count(),
                'low_stock_products' => $lowStockCount,
                'pending_purchase_orders' => PurchaseOrder::where('company_id', $companyId)->whereIn('status', ['draft', 'ordered'])->count(),
                'orders_confirmed_month' => Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $today->copy()->endOfDay()])->count(),
                'revenue_month' => (float) Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$monthStart, $today->copy()->endOfDay()])->sum('total'),
            ],
            'deltas' => [
                'revenue' => $this->delta(
                    $this->revenueBetween($companyId, $win1Start, $today),
                    $this->revenueBetween($companyId, $win2Start, $win1Start),
                ),
                'deals_won' => $this->delta(
                    $this->dealsWonBetween($companyId, $win1Start, $today),
                    $this->dealsWonBetween($companyId, $win2Start, $win1Start),
                ),
            ],
            'deals_by_stage' => Deal::query()
                ->selectRaw('stage, count(*) as total, coalesce(sum(amount), 0) as amount')
                ->where('company_id', $companyId)
                ->groupBy('stage')
                ->get(),
            'top_products' => Product::query()
                ->where('company_id', $companyId)
                ->withSum('stockMovements as stock_on_hand', 'quantity')
                ->orderByDesc('stock_on_hand')
                ->limit(6)
                ->get(['id', 'name', 'sku']),
            'trends' => [
                'revenue_monthly' => $this->revenueMonthly($companyId, $rangeStart),
                'deals_monthly' => $this->dealsMonthly($companyId, $rangeStart),
            ],
            'low_stock_alerts' => Product::query()
                ->whereIn('id', $this->lowStockProductIds($companyId))
                ->limit(6)
                ->get(['id', 'name', 'sku', 'reorder_level']),
            'recent_activity' => AuditLog::with('user:id,name')->where('company_id', $companyId)->latest()->limit(8)->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'module' => $log->module,
                    'user' => $log->user?->name,
                    'created_at' => $log->created_at,
                ]),
        ]);
    }

    /** @return array{current: float|int, previous: float|int, pct: float|null} */
    private function delta(float|int $current, float|int $previous): array
    {
        return [
            'current' => $current,
            'previous' => $previous,
            'pct' => $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : null,
        ];
    }

    private function revenueBetween(int $companyId, Carbon $from, Carbon $to): float
    {
        return (float) Order::where('company_id', $companyId)->where('status', 'confirmed')->whereBetween('updated_at', [$from, $to])->sum('total');
    }

    private function dealsWonBetween(int $companyId, Carbon $from, Carbon $to): int
    {
        return Deal::where('company_id', $companyId)->where('stage', 'won')->whereBetween('updated_at', [$from, $to])->count();
    }

    /** Productos cuya existencia (SUM de movimientos) cayo por debajo de su punto de reorden. */
    private function lowStockProductIds(int $companyId): Collection
    {
        return Product::query()
            ->where('company_id', $companyId)
            ->withSum('stockMovements as stock_on_hand', 'quantity')
            ->get()
            ->filter(fn (Product $p) => (int) ($p->stock_on_hand ?? 0) < $p->reorder_level)
            ->pluck('id');
    }

    /** @return list<string> Etiquetas "Y-m" de los ultimos 12 meses, mas antiguo primero. */
    private function monthKeys(): array
    {
        return collect(range(11, 0))->map(fn ($i) => Carbon::today()->subMonths($i)->format('Y-m'))->all();
    }

    /**
     * SQL para truncar una fecha a "Y-m" segun el motor. `$column` siempre es un
     * literal del propio codigo (nunca entrada de usuario).
     */
    private function monthExpr(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => "DATE_FORMAT($column, '%Y-%m')",
            'pgsql' => "to_char($column, 'YYYY-MM')",
            default => "strftime('%Y-%m', $column)",
        };
    }

    private function revenueMonthly(int $companyId, Carbon $from): Collection
    {
        $rows = Order::where('company_id', $companyId)->where('status', 'confirmed')
            ->where('updated_at', '>=', $from)
            ->selectRaw($this->monthExpr('updated_at').' as month, coalesce(sum(total), 0) as total')
            ->groupBy('month')->pluck('total', 'month');

        return collect($this->monthKeys())->map(fn (string $month) => ['month' => $month, 'revenue' => (float) ($rows[$month] ?? 0)]);
    }

    private function dealsMonthly(int $companyId, Carbon $from): Collection
    {
        $won = Deal::where('company_id', $companyId)->where('stage', 'won')->where('updated_at', '>=', $from)
            ->selectRaw($this->monthExpr('updated_at').' as month, count(*) as total')->groupBy('month')->pluck('total', 'month');
        $lost = Deal::where('company_id', $companyId)->where('stage', 'lost')->where('updated_at', '>=', $from)
            ->selectRaw($this->monthExpr('updated_at').' as month, count(*) as total')->groupBy('month')->pluck('total', 'month');

        return collect($this->monthKeys())->map(fn (string $month) => [
            'month' => $month,
            'won' => (int) ($won[$month] ?? 0),
            'lost' => (int) ($lost[$month] ?? 0),
        ]);
    }
}
