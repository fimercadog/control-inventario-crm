<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StockTransferTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Product $product;

    private Warehouse $from;

    private Warehouse $to;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['stock.manage', 'products.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['stock.manage', 'products.manage']);
        Sanctum::actingAs($user, ['*']);

        $this->product = Product::factory()->create(['company_id' => $this->company->id, 'reorder_level' => 10]);
        $this->from = Warehouse::factory()->create(['company_id' => $this->company->id]);
        $this->to = Warehouse::factory()->create(['company_id' => $this->company->id]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $this->product->id, 'warehouse_id' => $this->from->id,
            'type' => 'in', 'quantity' => 20, 'reason' => 'inicial',
        ]);
    }

    public function test_transfer_moves_stock_between_warehouses(): void
    {
        $this->postJson('/api/stock-transfers', [
            'product_id' => $this->product->id,
            'from_warehouse_id' => $this->from->id,
            'to_warehouse_id' => $this->to->id,
            'quantity' => 8,
        ])->assertCreated();

        $this->assertSame(12, $this->product->stockOnHand($this->from->id));
        $this->assertSame(8, $this->product->stockOnHand($this->to->id));
    }

    public function test_transfer_is_rejected_without_enough_stock(): void
    {
        $this->postJson('/api/stock-transfers', [
            'product_id' => $this->product->id,
            'from_warehouse_id' => $this->from->id,
            'to_warehouse_id' => $this->to->id,
            'quantity' => 999,
        ])->assertStatus(422)->assertJsonValidationErrors(['quantity']);

        $this->assertSame(20, $this->product->stockOnHand($this->from->id));
    }

    public function test_transfer_to_same_warehouse_is_rejected(): void
    {
        $this->postJson('/api/stock-transfers', [
            'product_id' => $this->product->id,
            'from_warehouse_id' => $this->from->id,
            'to_warehouse_id' => $this->from->id,
            'quantity' => 1,
        ])->assertStatus(422)->assertJsonValidationErrors(['to_warehouse_id']);
    }

    public function test_stock_alerts_lists_low_and_out_products(): void
    {
        // product tiene 20 en 'from', reorder 10 -> no aparece en "attention".
        $low = Product::factory()->create(['company_id' => $this->company->id, 'reorder_level' => 50]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $low->id, 'warehouse_id' => $this->from->id,
            'type' => 'in', 'quantity' => 5, 'reason' => 'inicial',
        ]);

        $this->getJson('/api/stock-alerts')
            ->assertOk()
            ->assertJsonPath('data.0.id', $low->id);
    }

    public function test_stock_alerts_are_ordered_most_critical_first(): void
    {
        // 'low' se creo primero pero tiene MENOS stock -> debe salir antes que 'lower_priority',
        // aunque este ultimo sea mas nuevo (el orden por defecto es created_at desc).
        $low = Product::factory()->create(['company_id' => $this->company->id, 'reorder_level' => 100]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $low->id, 'warehouse_id' => $this->from->id,
            'type' => 'in', 'quantity' => 2, 'reason' => 'x',
        ]);
        $mild = Product::factory()->create(['company_id' => $this->company->id, 'reorder_level' => 100]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $mild->id, 'warehouse_id' => $this->from->id,
            'type' => 'in', 'quantity' => 40, 'reason' => 'x',
        ]);

        $this->getJson('/api/stock-alerts')->assertOk()
            ->assertJsonPath('data.0.id', $low->id)
            ->assertJsonPath('data.1.id', $mild->id);
    }
}
