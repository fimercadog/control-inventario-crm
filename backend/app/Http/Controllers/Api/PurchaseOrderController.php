<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PurchaseOrderResource;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Services\AuditService;
use App\Services\PurchaseReceiptService;
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

    protected array $with = ['supplier', 'warehouse', 'items.product', 'receipts'];

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
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
        ]);

        $product = Product::find($data['product_id']);
        $lineTotal = round(((int) $data['quantity'] * (float) $data['unit_cost']) - (float) ($data['discount'] ?? 0) + (float) ($data['tax'] ?? 0), 2);
        $purchase_order->items()->create($data + [
            'product_name' => $product?->name,
            'sku' => $product?->sku,
            'line_total' => $lineTotal,
        ]);
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

    /** Compatibilidad: si no mandan items, recibe todo lo pendiente usando el flujo ERP parcial. */
    public function receive(Request $request, PurchaseOrder $purchase_order, AuditService $audit, PurchaseReceiptService $service)
    {
        abort_unless($purchase_order->company_id === $this->companyId($request), 404);
        abort_unless($purchase_order->status !== 'received', 422, 'Esta orden ya fue recibida.');
        abort_if($purchase_order->items()->count() === 0, 422, 'La orden no tiene lineas.');

        $data = $request->validate([
            'received_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable', 'array'],
            'items.*.purchase_order_item_id' => ['required_with:items', 'integer'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ]);
        $data['items'] ??= $purchase_order->items()->get()->map(fn ($item) => [
            'purchase_order_item_id' => $item->id,
            'quantity' => $item->pendingQuantity(),
        ])->filter(fn ($item) => $item['quantity'] > 0)->values()->all();

        $receipt = $service->confirm($purchase_order, $data, $request->user()->id);
        $audit->record('purchase_receipt.confirmed', $receipt, $request);
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
        $totals = $purchaseOrder->items()
            ->selectRaw('COALESCE(SUM(quantity * unit_cost), 0) as subtotal, COALESCE(SUM(discount), 0) as discount, COALESCE(SUM(tax), 0) as tax, COALESCE(SUM(line_total), 0) as total')
            ->first();
        $purchaseOrder->update([
            'subtotal' => $totals->subtotal ?? 0,
            'discount' => $totals->discount ?? 0,
            'tax' => $totals->tax ?? 0,
            'total' => $totals->total ?? 0,
        ]);
    }
}
