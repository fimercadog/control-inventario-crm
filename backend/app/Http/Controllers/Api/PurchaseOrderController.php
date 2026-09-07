<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Cabecera reutiliza BaseCrudController; items y el flujo de recepcion
 * (que genera StockMovement tipo "in") son propios de este dominio y no
 * encajan en el CRUD generico.
 */
class PurchaseOrderController extends BaseCrudController
{
    protected string $model = PurchaseOrder::class;
    protected string $resource = PurchaseOrderResource::class;
    protected array $with = ['supplier', 'warehouse', 'items.product'];
    protected array $searchable = [];
    protected array $filterable = ['status' => 'status', 'supplier_id' => 'supplier_id'];

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

    /** Nombre del parametro debe ser `purchase_order`: asi nombra Route::apiResource el wildcard para el recurso "purchase-orders". */
    public function addItem(Request $request, PurchaseOrder $purchase_order)
    {
        abort_unless($purchase_order->company_id === $this->companyId($request), 404);
        abort_unless($purchase_order->status === 'draft', 422, 'Solo se pueden agregar lineas a una orden en borrador.');

        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')->where('company_id', $purchase_order->company_id)],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $product = \App\Models\Product::find($data['product_id']);
        $purchase_order->items()->create($data + ['product_name' => $product?->name, 'sku' => $product?->sku]);
        $this->recalculateTotal($purchase_order);

        return new PurchaseOrderResource($purchase_order->load($this->with));
    }

    public function removeItem(Request $request, PurchaseOrder $purchase_order, int $item)
    {
        abort_unless($purchase_order->company_id === $this->companyId($request), 404);
        abort_unless($purchase_order->status === 'draft', 422, 'Solo se pueden quitar lineas de una orden en borrador.');

        $purchase_order->items()->findOrFail($item)->delete();
        $this->recalculateTotal($purchase_order);

        return new PurchaseOrderResource($purchase_order->load($this->with));
    }

    /** Marca la orden como recibida y genera las entradas de stock, una vez. */
    public function receive(Request $request, PurchaseOrder $purchase_order, AuditService $audit)
    {
        abort_unless($purchase_order->company_id === $this->companyId($request), 404);
        abort_unless($purchase_order->status !== 'received', 422, 'Esta orden ya fue recibida.');
        abort_if($purchase_order->items()->count() === 0, 422, 'La orden no tiene lineas.');

        foreach ($purchase_order->items()->with('product')->get() as $item) {
            StockMovement::create([
                'company_id' => $purchase_order->company_id,
                'product_id' => $item->product_id,
                'warehouse_id' => $purchase_order->warehouse_id,
                'type' => 'in',
                'quantity' => $item->quantity,
                'reason' => 'Recepcion de orden de compra',
                'reference' => 'purchase_order:'.$purchase_order->id,
            ]);
        }

        $purchase_order->update(['status' => 'received']);
        $audit->record('received', $purchase_order, $request);

        return new PurchaseOrderResource($purchase_order->load($this->with));
    }

    private function guardDraft(Request $request, string $id): void
    {
        $purchaseOrder = PurchaseOrder::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        abort_unless($purchaseOrder->status === 'draft', 422, 'Esta orden ya no esta en borrador.');
    }

    private function recalculateTotal(PurchaseOrder $purchaseOrder): void
    {
        $total = $purchaseOrder->items()->selectRaw('COALESCE(SUM(quantity * unit_cost), 0) as total')->value('total');
        $purchaseOrder->update(['total' => $total]);
    }
}
