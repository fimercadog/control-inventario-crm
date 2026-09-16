<?php

namespace Tests\Unit;

use App\Services\ErpTotals;
use PHPUnit\Framework\TestCase;

class ErpTotalsTest extends TestCase
{
    private ErpTotals $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new ErpTotals();
    }

    public function test_calculates_subtotal_discount_tax_and_total_accurately(): void
    {
        $items = [
            [
                'product_id' => 1,
                'quantity' => 3,
                'unit_price' => 15000,
                'discount' => 5000,
                'tax' => 7600,
            ],
            [
                'product_id' => 2,
                'quantity' => 2,
                'unit_price' => 30000,
                'discount' => 0,
                'tax' => 11400,
            ],
        ];

        $result = $this->calculator->calculate($items);

        // Item 1: 3 * 15000 = 45000 - 5000 + 7600 = 47600
        // Item 2: 2 * 30000 = 60000 - 0 + 11400 = 71400
        // Subtotal: 105000
        // Discount: 5000
        // Tax: 19000
        // Total: 119000
        $this->assertEquals(105000.00, $result['subtotal']);
        $this->assertEquals(5000.00, $result['discount']);
        $this->assertEquals(19000.00, $result['tax']);
        $this->assertEquals(119000.00, $result['total']);
        $this->assertCount(2, $result['items']);
        $this->assertEquals(47600.00, $result['items'][0]['line_total']);
        $this->assertEquals(71400.00, $result['items'][1]['line_total']);
    }

    public function test_handles_empty_items_array(): void
    {
        $result = $this->calculator->calculate([]);

        $this->assertEquals(0.00, $result['subtotal']);
        $this->assertEquals(0.00, $result['discount']);
        $this->assertEquals(0.00, $result['tax']);
        $this->assertEquals(0.00, $result['total']);
        $this->assertEmpty($result['items']);
    }

    public function test_handles_unit_cost_for_purchase_orders(): void
    {
        $items = [
            [
                'product_id' => 5,
                'quantity' => 10,
                'unit_cost' => 2500,
                'discount' => 1000,
                'tax' => 4560,
            ],
        ];

        $result = $this->calculator->calculate($items);

        $this->assertEquals(25000.00, $result['subtotal']);
        $this->assertEquals(1000.00, $result['discount']);
        $this->assertEquals(4560.00, $result['tax']);
        $this->assertEquals(28560.00, $result['total']);
    }
}
