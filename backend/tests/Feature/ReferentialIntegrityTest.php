<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ReferentialIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['products.manage', 'orders.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['products.manage', 'orders.manage']);
        Sanctum::actingAs($user, ['*']);
    }

    public function test_deleting_a_product_with_history_returns_a_clean_422(): void
    {
        $product = Product::factory()->create(['company_id' => $this->company->id]);
        $warehouse = Warehouse::factory()->create(['company_id' => $this->company->id]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id,
            'type' => 'in', 'quantity' => 5, 'reason' => 'x',
        ]);

        $this->deleteJson("/api/products/{$product->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'No se puede eliminar: hay registros historicos que dependen de este. Marcalo como inactivo.');

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_an_order_line_keeps_a_product_snapshot(): void
    {
        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $warehouse = Warehouse::factory()->create(['company_id' => $this->company->id]);
        $product = Product::factory()->create(['company_id' => $this->company->id, 'name' => 'Original', 'sku' => 'SNAP-1']);

        $order = Order::create([
            'company_id' => $this->company->id, 'client_id' => $client->id,
            'warehouse_id' => $warehouse->id, 'status' => 'draft', 'total' => 0,
        ]);

        $this->postJson("/api/orders/{$order->id}/items", [
            'product_id' => $product->id, 'quantity' => 2, 'unit_price' => 100,
        ])->assertOk();

        $product->update(['name' => 'Renombrado']);

        $this->getJson("/api/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.items.0.product', 'Original')
            ->assertJsonPath('data.items.0.sku', 'SNAP-1');
    }
}
