<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ErpAccountBalanceLogicTest extends TestCase
{
    public function test_initial_balance_equals_original_amount(): void
    {
        $originalAmount = 1500000.00;
        $paidAmount = 0.00;
        $balance = round($originalAmount - $paidAmount, 2);
        $status = $balance <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

        $this->assertEquals(1500000.00, $balance);
        $this->assertEquals('pending', $status);
    }

    public function test_partial_payment_deducts_balance_and_sets_partial_status(): void
    {
        $originalAmount = 1500000.00;
        $payment1 = 500000.00;

        $paidAmount = $payment1;
        $balance = round($originalAmount - $paidAmount, 2);
        $status = $balance <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

        $this->assertEquals(1000000.00, $balance);
        $this->assertEquals('partial', $status);
    }

    public function test_multiple_partial_payments_accumulate_accurately(): void
    {
        $originalAmount = 1000000.00;
        $payments = [250000.50, 350000.25, 100000.25];

        $paidAmount = 0.00;
        foreach ($payments as $pay) {
            $paidAmount += $pay;
        }
        $balance = round($originalAmount - $paidAmount, 2);
        $status = $balance <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

        $this->assertEquals(700001.00, $paidAmount);
        $this->assertEquals(299999.00, $balance);
        $this->assertEquals('partial', $status);
    }

    public function test_exact_full_payment_sets_balance_zero_and_paid_status(): void
    {
        $originalAmount = 850000.75;
        $payments = [500000.00, 350000.75];

        $paidAmount = array_sum($payments);
        $balance = round($originalAmount - $paidAmount, 2);
        $status = $balance <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

        $this->assertEquals(850000.75, $paidAmount);
        $this->assertEquals(0.00, $balance);
        $this->assertEquals('paid', $status);
    }

    public function test_overpayment_detection_logic(): void
    {
        $balance = 500000.00;
        $attemptedPayment = 500000.01;

        $isInvalid = $attemptedPayment <= 0 || $attemptedPayment > $balance;

        $this->assertTrue($isInvalid, 'Attempting to pay more than current balance must be recognized as invalid.');
    }

    public function test_zero_and_negative_payments_are_invalid(): void
    {
        $balance = 500000.00;

        $zeroPayment = 0.00;
        $negativePayment = -10000.00;

        $this->assertTrue($zeroPayment <= 0 || $zeroPayment > $balance);
        $this->assertTrue($negativePayment <= 0 || $negativePayment > $balance);
    }

    public function test_handles_extreme_small_decimal_installments(): void
    {
        $originalAmount = 100.00;
        // 3 payments of 33.33 and 1 of 0.01
        $payments = [33.33, 33.33, 33.33, 0.01];

        $paidAmount = round(array_sum($payments), 2);
        $balance = round($originalAmount - $paidAmount, 2);

        $this->assertEquals(100.00, $paidAmount);
        $this->assertEquals(0.00, $balance);
    }
}
