<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * La costura real entre CRM e Inventario: un pedido confirmado descuenta
 * stock, una orden de compra recibida lo repone. Es la unica logica de
 * negocio no trivial del pivote (el resto es CRUD generico), asi que es la
 * que mas vale cubrir con un test end-to-end.
 */
class OrderInventoryBridgeTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Warehouse $warehouse;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'Test SA']);
        $this->warehouse = Warehouse::factory()->create(['company_id' => $this->company->id]);
        $this->product = Product::factory()->create(['company_id' => $this->company->id, 'unit_price' => 1000]);

        foreach (['orders.manage', 'purchase_orders.manage'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['orders.manage', 'purchase_orders.manage']);
        Sanctum::actingAs($user, ['*']);
    }

    public function test_confirming_an_order_decrements_stock(): void
    {
        $supplier = Supplier::factory()->create(['company_id' => $this->company->id]);
        $po = $this->postJson('/api/purchase-orders', ['supplier_id' => $supplier->id, 'warehouse_id' => $this->warehouse->id])->json('data');
        $this->postJson("/api/purchase-orders/{$po['id']}/items", ['product_id' => $this->product->id, 'quantity' => 50, 'unit_cost' => 500])->assertOk();
        $this->postJson("/api/purchase-orders/{$po['id']}/receive")->assertOk();
        $this->assertSame(50, $this->product->fresh()->stockOnHand());

        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $order = $this->postJson('/api/orders', ['client_id' => $client->id, 'warehouse_id' => $this->warehouse->id])->json('data');
        $this->postJson("/api/orders/{$order['id']}/items", ['product_id' => $this->product->id, 'quantity' => 20, 'unit_price' => 1000])->assertOk();

        $this->postJson("/api/orders/{$order['id']}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertSame(30, $this->product->fresh()->stockOnHand());
    }

    public function test_confirming_an_order_without_enough_stock_is_rejected(): void
    {
        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $order = $this->postJson('/api/orders', ['client_id' => $client->id, 'warehouse_id' => $this->warehouse->id])->json('data');
        $this->postJson("/api/orders/{$order['id']}/items", ['product_id' => $this->product->id, 'quantity' => 5, 'unit_price' => 1000])->assertOk();

        $this->postJson("/api/orders/{$order['id']}/confirm")
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        $this->assertSame(0, $this->product->fresh()->stockOnHand());
    }
}
