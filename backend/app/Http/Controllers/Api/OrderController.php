<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\StockMovement;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Cabecera reutiliza BaseCrudController; items y el flujo de confirmacion
 * (que valida existencias y genera StockMovement tipo "out") son la costura
 * real entre CRM e Inventario, propia de este dominio.
 */
class OrderController extends BaseCrudController
{
    protected string $model = Order::class;
    protected string $resource = OrderResource::class;
    protected array $with = ['client', 'owner', 'warehouse', 'items.product'];
    protected array $searchable = [];
    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id'];

    public function update(Request $request, string $id, AuditService $audit)
    {
        $this->guardDraft($request, $id);

        return parent::update($request, $id, $audit);
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        $this->guardDraft($request, $id);

        return parent::destroy($request, $id, $audit);
    }

    public function addItem(Request $request, Order $order)
    {
        abort_unless($order->company_id === $this->companyId($request), 404);
        abort_unless($order->status === 'draft', 422, 'Solo se pueden agregar lineas a un pedido en borrador.');

        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')->where('company_id', $order->company_id)],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $product = \App\Models\Product::find($data['product_id']);
        $order->items()->create($data + ['product_name' => $product?->name, 'sku' => $product?->sku]);
        $this->recalculateTotal($order);

        return new OrderResource($order->load($this->with));
    }

    public function removeItem(Request $request, Order $order, int $item)
    {
        abort_unless($order->company_id === $this->companyId($request), 404);
        abort_unless($order->status === 'draft', 422, 'Solo se pueden quitar lineas de un pedido en borrador.');

        $order->items()->findOrFail($item)->delete();
        $this->recalculateTotal($order);

        return new OrderResource($order->load($this->with));
    }

    /** Confirma el pedido: valida stock disponible y genera las salidas. */
    public function confirm(Request $request, Order $order, AuditService $audit)
    {
        abort_unless($order->company_id === $this->companyId($request), 404);
        abort_unless($order->status === 'draft', 422, 'Este pedido ya no esta en borrador.');
        abort_if($order->items()->count() === 0, 422, 'El pedido no tiene lineas.');

        $items = $order->items()->with('product')->get();

        $shortages = $items
            ->filter(fn ($item) => $item->product->stockOnHand($order->warehouse_id) < $item->quantity)
            ->map(fn ($item) => $item->product->name);

        if ($shortages->isNotEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Sin existencias suficientes para: '.$shortages->implode(', ').'.',
            ]);
        }

        foreach ($items as $item) {
            StockMovement::create([
                'company_id' => $order->company_id,
                'product_id' => $item->product_id,
                'warehouse_id' => $order->warehouse_id,
                'type' => 'out',
                'quantity' => -$item->quantity,
                'reason' => 'Confirmacion de pedido',
                'reference' => 'order:'.$order->id,
            ]);
        }

        $order->update(['status' => 'confirmed']);
        $audit->record('confirmed', $order, $request);

        return new OrderResource($order->load($this->with));
    }

    private function guardDraft(Request $request, string $id): void
    {
        $order = Order::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        abort_unless($order->status === 'draft', 422, 'Este pedido ya no esta en borrador.');
    }

    private function recalculateTotal(Order $order): void
    {
        $total = $order->items()->selectRaw('COALESCE(SUM(quantity * unit_price), 0) as total')->value('total');
        $order->update(['total' => $total]);
    }
}
