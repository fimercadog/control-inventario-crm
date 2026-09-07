<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class InventoryCatalogTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'products.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('products.manage');
        Sanctum::actingAs($user, ['*']);
    }

    public function test_creates_and_lists_categories_with_product_count(): void
    {
        $this->postJson('/api/categories', ['name' => 'Herramientas', 'status' => 'active'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Herramientas');

        $category = Category::where('name', 'Herramientas')->firstOrFail();
        Product::factory()->count(2)->create([
            'company_id' => $this->company->id,
            'category_id' => $category->id,
        ]);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.products_count', 2);
    }

    public function test_product_links_to_catalogs_and_resource_exposes_names(): void
    {
        $category = Category::create(['company_id' => $this->company->id, 'name' => 'Herramientas', 'status' => 'active']);
        $brand = \App\Models\Brand::create(['company_id' => $this->company->id, 'name' => 'Bosch', 'status' => 'active']);
        $unit = \App\Models\Unit::create(['company_id' => $this->company->id, 'name' => 'Unidad', 'status' => 'active']);

        $this->postJson('/api/products', [
            'sku' => 'TAL-001', 'name' => 'Taladro', 'status' => 'active',
            'category_id' => $category->id, 'brand_id' => $brand->id, 'unit_id' => $unit->id,
            'unit_price' => 100, 'cost_price' => 60, 'reorder_level' => 5,
        ])->assertCreated();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'Herramientas')
            ->assertJsonPath('data.0.brand', 'Bosch')
            ->assertJsonPath('data.0.unit', 'Unidad');
    }

    public function test_product_accepts_public_catalog_fields(): void
    {
        // El form del panel manda is_public como "0"/"1" (string) -> la regla
        // `boolean` debe aceptarlo, si no el CRUD de Productos queda roto.
        $this->postJson('/api/products', [
            'sku' => 'PUB-1', 'name' => 'Publicable', 'status' => 'active',
            'unit_price' => 100, 'cost_price' => 60, 'reorder_level' => 5,
            'description' => 'Ficha para el catalogo', 'image_url' => 'https://ejemplo.co/img.jpg',
            'is_public' => '1',
        ])->assertCreated();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('data.0.is_public', true)
            ->assertJsonPath('data.0.description', 'Ficha para el catalogo');
    }

    public function test_rejects_a_product_with_a_nonexistent_category(): void
    {
        $this->postJson('/api/products', [
            'sku' => 'X-1', 'name' => 'X', 'status' => 'active', 'category_id' => 99999,
            'unit_price' => 1, 'cost_price' => 1, 'reorder_level' => 0,
        ])->assertStatus(422)->assertJsonValidationErrors(['category_id']);
    }

    public function test_rejects_invalid_unit_payload(): void
    {
        $this->postJson('/api/units', ['name' => '', 'status' => 'nope'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'status']);
    }

    public function test_a_role_without_products_manage_is_forbidden(): void
    {
        $outsider = User::factory()->create(['company_id' => $this->company->id]);
        Sanctum::actingAs($outsider, ['*']);

        $this->getJson('/api/brands')->assertForbidden();
    }
}
