<?php

namespace App\Services;

use App\Models\AccountPayable;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseReceiptService
{
    /**
     * @param  array{received_at?:string, notes?:string|null, idempotency_key?:string|null, items:array<int, array{purchase_order_item_id:int, quantity:int}>}  $data
     */
    public function confirm(PurchaseOrder $order, array $data, int $userId): PurchaseReceipt
    {
        return DB::transaction(function () use ($order, $data, $userId) {
            if (! empty($data['idempotency_key'])) {
                $existing = PurchaseReceipt::query()
                    ->where('company_id', $order->company_id)
                    ->where('idempotency_key', $data['idempotency_key'])
                    ->first();
                if ($existing) {
                    return $existing->load('items', 'purchaseOrder');
                }
            }

            $order = PurchaseOrder::query()->whereKey($order->id)->lockForUpdate()->with('items')->firstOrFail();
            abort_if($order->items->isEmpty(), 422, 'La orden no tiene lineas.');
            abort_if($order->status === 'cancelled', 422, 'La orden esta cancelada.');
            abort_if($order->status === 'received', 422, 'La orden ya fue recibida.');

            $receipt = PurchaseReceipt::create([
                'company_id' => $order->company_id,
                'purchase_order_id' => $order->id,
                'warehouse_id' => $order->warehouse_id,
                'user_id' => $userId,
                'received_at' => $data['received_at'] ?? now()->toDateString(),
                'status' => 'confirmed',
                'notes' => $data['notes'] ?? null,
                'idempotency_key' => $data['idempotency_key'] ?? null,
            ]);

            $receivedTotal = 0.0;
            foreach ($data['items'] as $line) {
                $item = $order->items->firstWhere('id', (int) $line['purchase_order_item_id']);
                if (! $item) {
                    throw ValidationException::withMessages(['items' => 'Una linea no pertenece a la orden.']);
                }

                $quantity = (int) $line['quantity'];
                if ($quantity < 1 || $quantity > $item->pendingQuantity()) {
                    throw ValidationException::withMessages(['items' => 'La cantidad recibida supera el pendiente.']);
                }

                $lineTotal = round($quantity * (float) $item->unit_cost, 2);
                $receipt->items()->create([
                    'purchase_order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name ?: $item->product?->name ?: 'Producto',
                    'sku' => $item->sku ?: $item->product?->sku,
                    'quantity' => $quantity,
                    'unit_cost' => $item->unit_cost,
                    'line_total' => $lineTotal,
                ]);

                StockMovement::create([
                    'company_id' => $order->company_id,
                    'user_id' => $userId,
                    'product_id' => $item->product_id,
                    'warehouse_id' => $order->warehouse_id,
                    'type' => 'COMPRA',
                    'quantity' => $quantity,
                    'reason' => 'Recepcion de compra',
                    'reference' => 'purchase_receipt:'.$receipt->id,
                    'idempotency_key' => 'receipt:'.$receipt->id.':item:'.$item->id,
                ]);

                $item->increment('received_quantity', $quantity);
                $receivedTotal += $lineTotal;
            }

            $order->refresh();
            $pending = $order->items()->get()->sum(fn ($item) => $item->pendingQuantity());
            $order->update(['status' => $pending > 0 ? 'partial' : 'received']);

            AccountPayable::create([
                'company_id' => $order->company_id,
                'supplier_id' => $order->supplier_id,
                'purchase_order_id' => $order->id,
                'purchase_receipt_id' => $receipt->id,
                'original_amount' => $receivedTotal,
                'paid_amount' => 0,
                'balance' => $receivedTotal,
                'due_date' => $order->expected_date,
                'status' => 'pending',
            ]);

            return $receipt->load('items', 'purchaseOrder');
        });
    }
}
