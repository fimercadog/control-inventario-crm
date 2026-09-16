<?php

namespace Tests\Feature;

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ErpMultiTenancyAndIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private Company $companyA;

    private Company $companyB;

    private User $userA;

    private User $userB;

    private Warehouse $warehouseA;

    private Warehouse $warehouseB;

    private Product $productA;

    private Product $productB;

    protected function setUp(): void
    {
        parent::setUp();

        $permissions = [
            'purchase_orders.manage',
            'purchase_receipts.manage',
            'invoices.manage',
            'accounts_receivable.view',
            'accounts_payable.view',
            'payments.manage',
            'cash.manage',
            'products.manage',
            'warehouses.manage',
            'suppliers.manage',
            'clients.manage',
        ];
        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $this->companyA = Company::factory()->create(['name' => 'Empresa A']);
        $this->companyB = Company::factory()->create(['name' => 'Empresa B']);

        $this->userA = User::factory()->create(['company_id' => $this->companyA->id]);
        $this->userA->givePermissionTo($permissions);

        $this->userB = User::factory()->create(['company_id' => $this->companyB->id]);
        $this->userB->givePermissionTo($permissions);

        $this->warehouseA = Warehouse::factory()->create(['company_id' => $this->companyA->id]);
        $this->warehouseB = Warehouse::factory()->create(['company_id' => $this->companyB->id]);

        $this->productA = Product::factory()->create(['company_id' => $this->companyA->id, 'unit_price' => 5000, 'cost_price' => 3000]);
        $this->productB = Product::factory()->create(['company_id' => $this->companyB->id, 'unit_price' => 7000, 'cost_price' => 4000]);
    }

    public function test_company_a_cannot_view_or_modify_company_b_invoices(): void
    {
        $clientB = Client::factory()->create(['company_id' => $this->companyB->id]);
        $invoiceB = Invoice::create([
            'company_id' => $this->companyB->id,
            'client_id' => $clientB->id,
            'warehouse_id' => $this->warehouseB->id,
            'number' => 'FI-000099',
            'status' => 'draft',
            'subtotal' => 10000,
            'total' => 10000,
        ]);

        Sanctum::actingAs($this->userA, ['*']);

        // Cannot view B's invoice in index
        $res = $this->getJson('/api/invoices')->assertOk();
        $this->assertEmpty(collect($res->json('data'))->where('id', $invoiceB->id));

        // Cannot view B's invoice directly
        $this->getJson("/api/invoices/{$invoiceB->id}")->assertNotFound();

        // Cannot issue B's invoice
        $this->postJson("/api/invoices/{$invoiceB->id}/issue")->assertNotFound();

        // Cannot void B's invoice
        $this->postJson("/api/invoices/{$invoiceB->id}/void")->assertNotFound();
    }

    public function test_company_a_cannot_view_or_pay_company_b_accounts_payable(): void
    {
        $supplierB = Supplier::factory()->create(['company_id' => $this->companyB->id]);
        $payableB = AccountPayable::create([
            'company_id' => $this->companyB->id,
            'supplier_id' => $supplierB->id,
            'original_amount' => 50000,
            'paid_amount' => 0,
            'balance' => 50000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($this->userA, ['*']);

        // Cannot list B's payables
        $res = $this->getJson('/api/accounts-payable')->assertOk();
        $this->assertEmpty(collect($res->json('data'))->where('id', $payableB->id));

        // Cannot pay B's payable
        $this->postJson('/api/payments', [
            'target_type' => 'payable',
            'target_id' => $payableB->id,
            'amount' => 10000,
        ])->assertNotFound();
    }

    public function test_company_a_cannot_access_company_b_cash_sessions_or_movements(): void
    {
        $registerB = CashRegister::create(['company_id' => $this->companyB->id, 'name' => 'Caja B']);
        $sessionB = CashSession::create([
            'company_id' => $this->companyB->id,
            'cash_register_id' => $registerB->id,
            'opened_at' => now(),
            'opening_amount' => 100000,
            'expected_amount' => 100000,
            'status' => 'open',
        ]);

        Sanctum::actingAs($this->userA, ['*']);

        // Cannot list B's cash registers or sessions
        $res = $this->getJson('/api/cash-sessions')->assertOk();
        $this->assertEmpty(collect($res->json('data'))->where('id', $sessionB->id));

        // Cannot close B's cash session
        $this->postJson("/api/cash-sessions/{$sessionB->id}/close", [
            'closing_amount' => 100000,
        ])->assertNotFound();
    }

    public function test_idempotency_prevents_duplicate_payments_and_cash_movements(): void
    {
        Sanctum::actingAs($this->userA, ['*']);

        $clientA = Client::factory()->create(['company_id' => $this->companyA->id]);
        $registerA = CashRegister::create(['company_id' => $this->companyA->id, 'name' => 'Caja A']);
        $sessionA = CashSession::create([
            'company_id' => $this->companyA->id,
            'cash_register_id' => $registerA->id,
            'opened_at' => now(),
            'opening_amount' => 0,
            'expected_amount' => 0,
            'status' => 'open',
        ]);

        $invoiceA = Invoice::create([
            'company_id' => $this->companyA->id,
            'client_id' => $clientA->id,
            'warehouse_id' => $this->warehouseA->id,
            'number' => 'FI-000001',
            'status' => 'issued',
            'subtotal' => 10000,
            'total' => 10000,
        ]);

        $receivableA = AccountReceivable::create([
            'company_id' => $this->companyA->id,
            'client_id' => $clientA->id,
            'invoice_id' => $invoiceA->id,
            'original_amount' => 10000,
            'paid_amount' => 0,
            'balance' => 10000,
            'status' => 'pending',
        ]);

        $payload = [
            'target_type' => 'receivable',
            'target_id' => $receivableA->id,
            'amount' => 4000,
            'cash_session_id' => $sessionA->id,
            'idempotency_key' => 'idempotent-payment-key-001',
        ];

        // First attempt
        $res1 = $this->postJson('/api/payments', $payload)->assertCreated();
        $paymentId1 = $res1->json('data.id');

        // Repeated attempt (simulating double click / network retry)
        $res2 = $this->postJson('/api/payments', $payload)->assertCreated();
        $paymentId2 = $res2->json('data.id');

        // Must return the exact same payment ID
        $this->assertSame($paymentId1, $paymentId2);

        // Only 1 payment in DB
        $this->assertEquals(1, Payment::where('company_id', $this->companyA->id)->count());

        // Balance should reflect exactly 1 payment: 10000 - 4000 = 6000
        $this->assertEquals(6000, $receivableA->fresh()->balance);
        $this->assertEquals(4000, $receivableA->fresh()->paid_amount);

        // Cash session expected amount reflects exactly 1 entry: 4000
        $this->assertEquals(4000, $sessionA->fresh()->expected_amount);
    }
}
