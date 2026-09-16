<?php

namespace Tests\Unit;

use App\Models\PurchaseOrderItem;
use PHPUnit\Framework\TestCase;

class ErpPurchaseReceiptLogicTest extends TestCase
{
    public function test_purchase_order_item_pending_quantity_initial(): void
    {
        $item = new PurchaseOrderItem([
            'quantity' => 50,
            'received_quantity' => 0,
        ]);

        $this->assertEquals(50, $item->pendingQuantity());
    }

    public function test_purchase_order_item_pending_quantity_partial(): void
    {
        $item = new PurchaseOrderItem([
            'quantity' => 50,
            'received_quantity' => 20,
        ]);

        $this->assertEquals(30, $item->pendingQuantity());
    }

    public function test_purchase_order_item_pending_quantity_complete(): void
    {
        $item = new PurchaseOrderItem([
            'quantity' => 50,
            'received_quantity' => 50,
        ]);

        $this->assertEquals(0, $item->pendingQuantity());
    }

    public function test_purchase_order_item_pending_quantity_never_negative(): void
    {
        $item = new PurchaseOrderItem([
            'quantity' => 50,
            'received_quantity' => 60,
        ]);

        $this->assertEquals(0, $item->pendingQuantity());
    }

    public function test_purchase_order_status_resolution_from_items(): void
    {
        // Case 1: All items have 0 received -> pending
        $lines = [
            ['quantity' => 10, 'received' => 0],
            ['quantity' => 20, 'received' => 0],
        ];
        $totalPending = array_sum(array_map(fn ($l) => max(0, $l['quantity'] - $l['received']), $lines));
        $totalReceived = array_sum(array_column($lines, 'received'));
        $status = $totalPending === 0 ? 'received' : ($totalReceived > 0 ? 'partial' : 'confirmed');
        $this->assertEquals('confirmed', $status);

        // Case 2: Partial reception on one item -> partial
        $lines[0]['received'] = 5;
        $totalPending = array_sum(array_map(fn ($l) => max(0, $l['quantity'] - $l['received']), $lines));
        $totalReceived = array_sum(array_column($lines, 'received'));
        $status = $totalPending === 0 ? 'received' : ($totalReceived > 0 ? 'partial' : 'confirmed');
        $this->assertEquals('partial', $status);

        // Case 3: Complete reception on all items -> received
        $lines[0]['received'] = 10;
        $lines[1]['received'] = 20;
        $totalPending = array_sum(array_map(fn ($l) => max(0, $l['quantity'] - $l['received']), $lines));
        $totalReceived = array_sum(array_column($lines, 'received'));
        $status = $totalPending === 0 ? 'received' : ($totalReceived > 0 ? 'partial' : 'confirmed');
        $this->assertEquals('received', $status);
    }

    public function test_reception_line_amount_calculation(): void
    {
        $receivedItems = [
            ['quantity' => 15, 'unit_cost' => 12500.50],
            ['quantity' => 8, 'unit_cost' => 45000.00],
        ];

        $totalPayable = 0.0;
        foreach ($receivedItems as $item) {
            $lineTotal = round($item['quantity'] * $item['unit_cost'], 2);
            $totalPayable += $lineTotal;
        }

        // 15 * 12500.50 = 187507.50
        // 8 * 45000.00 = 360000.00
        // Total = 547507.50
        $this->assertEquals(547507.50, round($totalPayable, 2));
    }
}
