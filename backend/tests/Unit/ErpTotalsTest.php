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

    public function test_handles_zero_values_and_free_items(): void
    {
        $items = [
            [
                'product_id' => 10,
                'quantity' => 5,
                'unit_price' => 0,
                'discount' => 0,
                'tax' => 0,
            ],
        ];

        $result = $this->calculator->calculate($items);

        $this->assertEquals(0.00, $result['subtotal']);
        $this->assertEquals(0.00, $result['discount']);
        $this->assertEquals(0.00, $result['tax']);
        $this->assertEquals(0.00, $result['total']);
        $this->assertEquals(0.00, $result['items'][0]['line_total']);
    }

    public function test_handles_100_percent_discount(): void
    {
        $items = [
            [
                'product_id' => 11,
                'quantity' => 2,
                'unit_price' => 50000,
                'discount' => 100000, // 100% discount
                'tax' => 0,
            ],
        ];

        $result = $this->calculator->calculate($items);

        $this->assertEquals(100000.00, $result['subtotal']);
        $this->assertEquals(100000.00, $result['discount']);
        $this->assertEquals(0.00, $result['tax']);
        $this->assertEquals(0.00, $result['total']);
        $this->assertEquals(0.00, $result['items'][0]['line_total']);
    }

    public function test_handles_extreme_large_monetary_values(): void
    {
        $items = [
            [
                'product_id' => 20,
                'quantity' => 10000,
                'unit_price' => 25000000.50,
                'discount' => 500000.00,
                'tax' => 47500000000.00,
            ],
        ];

        $result = $this->calculator->calculate($items);

        $expectedSubtotal = 250000005000.00; // 10000 * 25000000.50 = 250,000,005,000.00
        $expectedTotal = $expectedSubtotal - 500000.00 + 47500000000.00;

        $this->assertEquals($expectedSubtotal, $result['subtotal']);
        $this->assertEquals(500000.00, $result['discount']);
        $this->assertEquals(47500000000.00, $result['tax']);
        $this->assertEquals($expectedTotal, $result['total']);
    }

    public function test_handles_floating_point_rounding_precision(): void
    {
        $items = [
            [
                'product_id' => 30,
                'quantity' => 3,
                'unit_price' => 33333.3333,
                'discount' => 0.00,
                'tax' => 19000.00,
            ],
            [
                'product_id' => 31,
                'quantity' => 7,
                'unit_price' => 14285.7142,
                'discount' => 500.555,
                'tax' => 18999.444,
            ],
        ];

        $result = $this->calculator->calculate($items);

        $this->assertIsFloat($result['subtotal']);
        $this->assertIsFloat($result['total']);
        $this->assertEquals(200000.00, $result['subtotal']);
        $this->assertEquals(500.56, $result['discount']);
        $this->assertEquals(37999.44, $result['tax']);
        $this->assertEquals(237498.89, $result['total']);
    }
}
