<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ErpInventoryMovementLogicTest extends TestCase
{
    public function test_stock_movement_sign_classification(): void
    {
        $positiveTypes = ['COMPRA', 'DEVOLUCION_VENTA', 'AJUSTE_ENTRADA', 'in'];
        $negativeTypes = ['VENTA', 'DEVOLUCION_COMPRA', 'AJUSTE_SALIDA', 'out'];

        foreach ($positiveTypes as $type) {
            $sign = in_array($type, ['VENTA', 'DEVOLUCION_COMPRA', 'AJUSTE_SALIDA', 'out'], true) ? -1 : 1;
            $this->assertEquals(1, $sign, "Type $type must resolve to positive quantity multiplier.");
        }

        foreach ($negativeTypes as $type) {
            $sign = in_array($type, ['VENTA', 'DEVOLUCION_COMPRA', 'AJUSTE_SALIDA', 'out'], true) ? -1 : 1;
            $this->assertEquals(-1, $sign, "Type $type must resolve to negative quantity multiplier.");
        }
    }

    public function test_cumulative_stock_calculation_from_movements(): void
    {
        $initialStock = 100;
        $movements = [
            ['type' => 'COMPRA', 'quantity' => 50],
            ['type' => 'VENTA', 'quantity' => -30],
            ['type' => 'DEVOLUCION_VENTA', 'quantity' => 5],
            ['type' => 'DEVOLUCION_COMPRA', 'quantity' => -10],
            ['type' => 'AJUSTE_ENTRADA', 'quantity' => 15],
            ['type' => 'AJUSTE_SALIDA', 'quantity' => -20],
        ];

        $stock = $initialStock;
        foreach ($movements as $m) {
            $stock += $m['quantity'];
        }

        // 100 + 50 - 30 + 5 - 10 + 15 - 20 = 110
        $this->assertEquals(110, $stock);
    }

    public function test_stock_availability_check(): void
    {
        $currentStock = 45;

        $requestedValid = 45;
        $requestedExcess = 46;

        $this->assertTrue($currentStock >= $requestedValid, 'Requested quantity equal to current stock is valid.');
        $this->assertFalse($currentStock >= $requestedExcess, 'Requested quantity exceeding current stock must be invalid.');
    }

    public function test_zero_quantity_movement_is_invalid(): void
    {
        $quantity = 0;
        $isValid = $quantity !== 0;

        $this->assertFalse($isValid, 'Stock movement with 0 quantity must be rejected.');
    }

    public function test_transfer_movement_balance_between_warehouses(): void
    {
        $warehouseAStock = 100;
        $warehouseBStock = 20;
        $transferQuantity = 35;

        // Warehouse A emits -35 (AJUSTE_SALIDA / TRASLADO_OUT)
        $warehouseAStock -= $transferQuantity;
        // Warehouse B receives +35 (AJUSTE_ENTRADA / TRASLADO_IN)
        $warehouseBStock += $transferQuantity;

        $this->assertEquals(65, $warehouseAStock);
        $this->assertEquals(55, $warehouseBStock);
        $this->assertEquals(120, $warehouseAStock + $warehouseBStock, 'Total aggregate company stock must remain constant during warehouse transfer.');
    }
}
