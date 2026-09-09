<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ClinicalApplication;
use App\Models\Company;
use App\Models\Patient;
use App\Models\Product;
use App\Models\Species;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S7 — Vacunas / Desparasitaciones. Acto clínico ≠ producto de inventario;
 * si hay product_id, descuenta stock.
 */
class ClinicalApplicationTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        Permission::firstOrCreate(['name' => 'vaccinations.manage', 'guard_name' => 'web']);

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('vaccinations.manage');
        Sanctum::actingAs($user, ['*']);

        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $species = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->patient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $client->id, 'species_id' => $species->id,
            'name' => 'Luna', 'sex' => 'female', 'status' => 'active',
        ]);
    }

    public function test_records_a_vaccination_without_touching_stock(): void
    {
        $this->postJson('/api/clinical-applications', [
            'type' => 'vaccine',
            'patient_id' => $this->patient->id,
            'name' => 'Antirrábica',
            'applied_at' => now()->toDateString(),
            'lot' => 'L1234',
            'next_due_at' => now()->addYear()->toDateString(),
        ])->assertCreated()->assertJsonPath('data.stock_movement_id', null);

        $this->assertSame(0, StockMovement::count());
    }

    public function test_applying_a_product_discounts_stock(): void
    {
        $warehouse = Warehouse::create(['company_id' => $this->company->id, 'name' => 'Central', 'status' => 'active']);
        $product = Product::create([
            'company_id' => $this->company->id, 'sku' => 'VAC-001', 'name' => 'Vacuna Antirrábica',
            'unit_price' => 20000, 'cost_price' => 8000, 'reorder_level' => 5, 'status' => 'active',
        ]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id,
            'type' => 'in', 'quantity' => 10, 'reason' => 'Compra',
        ]);

        $response = $this->postJson('/api/clinical-applications', [
            'type' => 'vaccine',
            'patient_id' => $this->patient->id,
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 2,
            'name' => 'Antirrábica',
            'applied_at' => now()->toDateString(),
        ])->assertCreated();

        $movementId = $response->json('data.stock_movement_id');
        $this->assertNotNull($movementId);
        $this->assertDatabaseHas('stock_movements', ['id' => $movementId, 'type' => 'out', 'quantity' => -2]);
        // 10 in - 2 out = 8
        $this->assertSame(8, (int) StockMovement::where('product_id', $product->id)->sum('quantity'));
    }

    public function test_product_requires_a_warehouse(): void
    {
        $product = Product::create([
            'company_id' => $this->company->id, 'sku' => 'X', 'name' => 'X',
            'unit_price' => 0, 'cost_price' => 0, 'reorder_level' => 0, 'status' => 'active',
        ]);

        $this->postJson('/api/clinical-applications', [
            'type' => 'vaccine', 'patient_id' => $this->patient->id, 'product_id' => $product->id,
            'name' => 'X', 'applied_at' => now()->toDateString(),
        ])->assertStatus(422)->assertJsonValidationErrors('warehouse_id');
    }

    public function test_due_view_lists_applications_with_upcoming_next_due(): void
    {
        ClinicalApplication::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'type' => 'vaccine',
            'name' => 'Pronto', 'applied_at' => now()->subYear()->toDateString(), 'next_due_at' => now()->addDays(10)->toDateString(),
        ]);
        ClinicalApplication::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'type' => 'vaccine',
            'name' => 'Lejos', 'applied_at' => now()->toDateString(), 'next_due_at' => now()->addMonths(6)->toDateString(),
        ]);

        $data = $this->getJson('/api/clinical-applications/due')->assertOk()->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('Pronto', $data[0]['name']);
    }

    public function test_soft_delete_does_not_revert_stock(): void
    {
        $warehouse = Warehouse::create(['company_id' => $this->company->id, 'name' => 'Central', 'status' => 'active']);
        $product = Product::create([
            'company_id' => $this->company->id, 'sku' => 'P', 'name' => 'P',
            'unit_price' => 0, 'cost_price' => 0, 'reorder_level' => 0, 'status' => 'active',
        ]);
        StockMovement::create([
            'company_id' => $this->company->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id,
            'type' => 'in', 'quantity' => 5, 'reason' => 'Compra',
        ]);

        $id = $this->postJson('/api/clinical-applications', [
            'type' => 'vaccine', 'patient_id' => $this->patient->id, 'product_id' => $product->id,
            'warehouse_id' => $warehouse->id, 'name' => 'V', 'applied_at' => now()->toDateString(),
        ])->json('data.id');

        $this->deleteJson("/api/clinical-applications/{$id}")->assertNoContent();

        $this->assertSoftDeleted('clinical_applications', ['id' => $id]);
        // El movimiento de salida sigue ahí: 5 - 1 = 4.
        $this->assertSame(4, (int) StockMovement::where('product_id', $product->id)->sum('quantity'));
    }
}
