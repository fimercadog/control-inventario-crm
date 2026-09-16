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

class StockMovementValidationTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $user;

    private Warehouse $warehouse;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'Stock Test Co']);
        $this->warehouse = Warehouse::factory()->create(['company_id' => $this->company->id]);
        $this->product = Product::factory()->create(['company_id' => $this->company->id]);

        Permission::firstOrCreate(['name' => 'stock.manage', 'guard_name' => 'web']);
        $this->user = User::factory()->create(['company_id' => $this->company->id]);
        $this->user->givePermissionTo('stock.manage');

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_records_stock_movements_with_correct_sign(): void
    {
        // AJUSTE_ENTRADA -> positive quantity
        $resIn = $this->postJson('/api/stock-movements', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'AJUSTE_ENTRADA',
            'quantity' => 20,
            'reason' => 'Conteo físico favorable',
        ])->assertCreated();

        $this->assertSame(20, $resIn->json('data.quantity'));
        $this->assertSame(20, $this->product->fresh()->stockOnHand($this->warehouse->id));

        // AJUSTE_SALIDA -> negative quantity
        $resOut = $this->postJson('/api/stock-movements', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'AJUSTE_SALIDA',
            'quantity' => 5,
            'reason' => 'Materia prima dañada',
        ])->assertCreated();

        $this->assertSame(-5, $resOut->json('data.quantity'));
        $this->assertSame(15, $this->product->fresh()->stockOnHand($this->warehouse->id));

        // COMPRA -> positive
        $resCompra = $this->postJson('/api/stock-movements', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'COMPRA',
            'quantity' => 30,
        ])->assertCreated();
        $this->assertSame(30, $resCompra->json('data.quantity'));
        $this->assertSame(45, $this->product->fresh()->stockOnHand($this->warehouse->id));

        // VENTA -> negative
        $resVenta = $this->postJson('/api/stock-movements', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'VENTA',
            'quantity' => 10,
        ])->assertCreated();
        $this->assertSame(-10, $resVenta->json('data.quantity'));
        $this->assertSame(35, $this->product->fresh()->stockOnHand($this->warehouse->id));
    }
}
