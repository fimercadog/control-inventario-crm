<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PurchaseReceiptResource;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Services\AuditService;
use App\Services\PurchaseReceiptService;
use Illuminate\Http\Request;

class PurchaseReceiptController extends BaseCrudController
{
    protected string $model = PurchaseReceipt::class;

    protected string $resource = PurchaseReceiptResource::class;

    protected array $with = ['warehouse', 'purchaseOrder.supplier', 'items'];

    protected array $filterable = ['status' => 'status', 'purchase_order_id' => 'purchase_order_id'];

    public function store(Request $request, AuditService $audit)
    {
        $service = app(PurchaseReceiptService::class);
        $data = $request->validate([
            'purchase_order_id' => ['required', 'integer'],
            'received_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required_with:items', 'integer'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ]);

        $order = PurchaseOrder::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($data['purchase_order_id']);
        $data['items'] ??= $order->items()->get()->map(fn ($item) => [
            'purchase_order_item_id' => $item->id,
            'quantity' => $item->pendingQuantity(),
        ])->filter(fn ($item) => $item['quantity'] > 0)->values()->all();

        $receipt = $service->confirm($order, $data, $request->user()->id);
        $audit->record('purchase_receipt.confirmed', $receipt, $request);

        return (new PurchaseReceiptResource($receipt->load($this->with)))->response()->setStatusCode(201);
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Las recepciones confirmadas no se editan. Crea un ajuste o devolucion.');
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        abort(405, 'Las recepciones confirmadas no se eliminan.');
    }
}
