<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ErpCashSessionLogicTest extends TestCase
{
    public function test_expected_amount_without_movements_equals_opening_amount(): void
    {
        $openingAmount = 150000.00;
        $movements = [];

        $movementTotal = array_sum(array_column($movements, 'amount'));
        $expectedAmount = round($openingAmount + $movementTotal, 2);

        $this->assertEquals(150000.00, $expectedAmount);
    }

    public function test_expected_amount_with_mixed_in_and_out_movements(): void
    {
        $openingAmount = 200000.00;
        $movements = [
            ['type' => 'in', 'amount' => 50000.00],
            ['type' => 'in', 'amount' => 120000.50],
            ['type' => 'out', 'amount' => -35000.25],
            ['type' => 'out', 'amount' => -15000.00],
        ];

        $movementTotal = array_sum(array_column($movements, 'amount'));
        $expectedAmount = round($openingAmount + $movementTotal, 2);

        // 200000 + 50000 + 120000.50 - 35000.25 - 15000.00 = 320000.25
        $this->assertEquals(320000.25, $expectedAmount);
    }

    public function test_closing_difference_exact_match(): void
    {
        $openingAmount = 100000.00;
        $movementTotal = 50000.00;
        $expected = round($openingAmount + $movementTotal, 2);

        $closingCash = 150000.00;
        $difference = round($closingCash - $expected, 2);

        $this->assertEquals(0.00, $difference);
    }

    public function test_closing_difference_surplus_sobrante(): void
    {
        $openingAmount = 100000.00;
        $movementTotal = 50000.00;
        $expected = round($openingAmount + $movementTotal, 2);

        $closingCash = 155000.00; // $5.000 surplus
        $difference = round($closingCash - $expected, 2);

        $this->assertEquals(5000.00, $difference);
        $this->assertGreaterThan(0, $difference);
    }

    public function test_closing_difference_deficit_faltante(): void
    {
        $openingAmount = 100000.00;
        $movementTotal = 50000.00;
        $expected = round($openingAmount + $movementTotal, 2);

        $closingCash = 142500.50; // $7.499,50 deficit
        $difference = round($closingCash - $expected, 2);

        $this->assertEquals(-7499.50, $difference);
        $this->assertLessThan(0, $difference);
    }

    public function test_many_micro_transactions_preserve_arithmetic_precision(): void
    {
        $openingAmount = 1000.00;
        $movements = [];

        // 100 in movements of $10.33
        for ($i = 0; $i < 100; $i++) {
            $movements[] = ['type' => 'in', 'amount' => 10.33];
        }
        // 100 out movements of $5.11
        for ($i = 0; $i < 100; $i++) {
            $movements[] = ['type' => 'out', 'amount' => -5.11];
        }

        $movementTotal = array_sum(array_column($movements, 'amount'));
        $expected = round($openingAmount + $movementTotal, 2);

        // 1000 + (100 * 10.33) - (100 * 5.11) = 1000 + 1033.00 - 511.00 = 1522.00
        $this->assertEquals(1522.00, $expected);
    }
}
