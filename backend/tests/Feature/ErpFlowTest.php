<?php

namespace Tests\Feature;

use App\Models\CashRegister;
use App\Models\Client;
use App\Models\Company;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ErpFlowTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Warehouse $warehouse;

    private Product $product;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'ERP Test SA']);
        $this->warehouse = Warehouse::factory()->create(['company_id' => $this->company->id]);
        $this->product = Product::factory()->create([
            'company_id' => $this->company->id,
            'unit_price' => 1000,
            'cost_price' => 600,
        ]);

        $permissions = [
            'purchase_orders.manage',
            'purchase_receipts.manage',
            'invoices.manage',
            'accounts_receivable.view',
            'accounts_payable.view',
            'payments.manage',
            'cash.manage',
        ];
        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $this->user = User::factory()->create(['company_id' => $this->company->id]);
        $this->user->givePermissionTo($permissions);
        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_purchase_partial_receipts_create_stock_payables_payments_and_cash_out(): void
    {
        $supplier = Supplier::factory()->create(['company_id' => $this->company->id]);
        $register = CashRegister::create(['company_id' => $this->company->id, 'name' => 'Caja principal']);

        $cashSession = $this->postJson('/api/cash-sessions', [
            'cash_register_id' => $register->id,
            'opening_amount' => 1000,
        ])->assertCreated()->json('data');

        $po = $this->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'warehouse_id' => $this->warehouse->id,
        ])->assertCreated()->json('data');
        $po = $this->postJson("/api/purchase-orders/{$po['id']}/items", [
            'product_id' => $this->product->id,
            'quantity' => 100,
            'unit_cost' => 600,
        ])->assertOk()->json('data');

        $this->postJson('/api/purchase-receipts', [
            'purchase_order_id' => $po['id'],
            'items' => [['purchase_order_item_id' => $po['items'][0]['id'], 'quantity' => 40]],
            'idempotency_key' => 'receipt-40',
        ])->assertCreated();

        $this->assertSame(40, $this->product->fresh()->stockOnHand($this->warehouse->id));
        $this->assertDatabaseHas('purchase_orders', ['id' => $po['id'], 'status' => 'partial']);
        $this->assertDatabaseHas('accounts_payable', ['purchase_order_id' => $po['id'], 'balance' => 24000]);

        $this->postJson('/api/purchase-receipts', [
            'purchase_order_id' => $po['id'],
            'items' => [['purchase_order_item_id' => $po['items'][0]['id'], 'quantity' => 60]],
            'idempotency_key' => 'receipt-60',
        ])->assertCreated();

        $this->assertSame(100, $this->product->fresh()->stockOnHand($this->warehouse->id));
        $this->assertDatabaseHas('purchase_orders', ['id' => $po['id'], 'status' => 'received']);

        $payables = $this->getJson('/api/accounts-payable')->json('data');
        $payableId = (int) collect($payables)->firstWhere('original_amount', 24000)['id'];
        $this->postJson('/api/payments', [
            'target_type' => 'payable',
            'target_id' => $payableId,
            'amount' => 24000,
            'cash_session_id' => $cashSession['id'],
            'idempotency_key' => 'payable-payment',
        ])->assertCreated();

        $this->assertDatabaseHas('accounts_payable', ['id' => $payableId, 'balance' => 0, 'status' => 'paid']);
        $this->assertDatabaseHas('cash_movements', ['cash_session_id' => $cashSession['id'], 'type' => 'out', 'amount' => -24000]);
    }

    public function test_invoice_issue_creates_stock_out_receivable_partial_and_final_payments(): void
    {
        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $register = CashRegister::create(['company_id' => $this->company->id, 'name' => 'Caja principal']);
        StockMovement::create([
            'company_id' => $this->company->id,
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'COMPRA',
            'quantity' => 10,
            'reason' => 'Stock inicial test',
        ]);

        $cashSession = $this->postJson('/api/cash-sessions', [
            'cash_register_id' => $register->id,
            'opening_amount' => 0,
        ])->assertCreated()->json('data');

        $invoice = $this->postJson('/api/invoices', [
            'client_id' => $client->id,
            'warehouse_id' => $this->warehouse->id,
            'due_date' => now()->addDays(15)->toDateString(),
            'items' => [[
                'product_id' => $this->product->id,
                'quantity' => 2,
                'unit_price' => 1000,
                'discount' => 100,
                'tax' => 190,
            ]],
            'idempotency_key' => 'invoice-draft',
        ])->assertCreated()
            ->assertJsonPath('data.total', '2090.00')
            ->json('data');

        $this->postJson("/api/invoices/{$invoice['id']}/issue")
            ->assertOk()
            ->assertJsonPath('data.status', 'issued');

        $this->assertSame(8, $this->product->fresh()->stockOnHand($this->warehouse->id));
        $receivableId = (int) $this->getJson('/api/accounts-receivable')->json('data.0.id');

        $this->postJson('/api/payments', [
            'target_type' => 'receivable',
            'target_id' => $receivableId,
            'amount' => 500,
            'cash_session_id' => $cashSession['id'],
            'idempotency_key' => 'partial-payment',
        ])->assertCreated();

        $this->assertDatabaseHas('accounts_receivable', ['id' => $receivableId, 'paid_amount' => 500, 'balance' => 1590, 'status' => 'partial']);

        $this->postJson('/api/payments', [
            'target_type' => 'receivable',
            'target_id' => $receivableId,
            'amount' => 1590,
            'cash_session_id' => $cashSession['id'],
            'idempotency_key' => 'final-payment',
        ])->assertCreated();

        $this->assertDatabaseHas('accounts_receivable', ['id' => $receivableId, 'balance' => 0, 'status' => 'paid']);
        $this->assertDatabaseHas('invoices', ['id' => $invoice['id'], 'status' => 'paid']);
        $this->assertDatabaseHas('cash_sessions', ['id' => $cashSession['id'], 'expected_amount' => 2090]);
    }
}
