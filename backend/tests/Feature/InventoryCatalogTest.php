<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $brand = Brand::create(['company_id' => $this->company->id, 'name' => 'Bosch', 'status' => 'active']);
        $unit = Unit::create(['company_id' => $this->company->id, 'name' => 'Unidad', 'status' => 'active']);

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
            'description' => 'Ficha para el catalogo',
            'is_public' => '1',
        ])->assertCreated();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('data.0.is_public', true)
            ->assertJsonPath('data.0.description', 'Ficha para el catalogo');
    }

    /**
     * `image_url` es contenido del catalogo pero SOLO lo fija el servidor por el
     * endpoint de upload. Un `image_url` en el payload de crear/editar un
     * producto (URL externa arbitraria) se ignora: no se guarda ni se sirve.
     */
    public function test_image_url_cannot_be_set_through_the_product_payload(): void
    {
        $evil = 'https://malicioso.example/tracker.gif';

        $created = $this->postJson('/api/products', [
            'sku' => 'IMG-1', 'name' => 'Sin imagen', 'status' => 'active',
            'unit_price' => 100, 'cost_price' => 60, 'reorder_level' => 5,
            'image_url' => $evil,
        ])->assertCreated()->json('data.id');

        $this->assertNull(Product::find($created)->image_url);

        // Tampoco por PUT ni PATCH.
        $this->putJson("/api/products/{$created}", [
            'sku' => 'IMG-1', 'name' => 'Sin imagen', 'status' => 'active',
            'unit_price' => 100, 'cost_price' => 60, 'reorder_level' => 5,
            'image_url' => $evil,
        ])->assertOk();
        $this->patchJson("/api/products/{$created}", ['image_url' => $evil])->assertOk();

        $this->assertNull(Product::find($created)->image_url);
        $this->getJson('/api/products')->assertOk()->assertJsonPath('data.0.image_url', null);
    }

    /** Una imagen subida por el endpoint SI queda disponible dinamicamente en la API. */
    public function test_an_uploaded_image_is_served_dynamically_by_the_api(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create(['company_id' => $this->company->id]);

        $this->postJson("/api/products/{$product->id}/image", [
            'image' => $this->fixtureUpload('pixel.jpg', 'foto.jpg', 'image/jpeg'),
        ])->assertOk();

        $served = $this->getJson('/api/products')->assertOk()->json('data.0.image_url');
        $this->assertMatchesRegularExpression('#^/storage/products/'.$this->company->id.'/[A-Za-z0-9]{40}\.jpg$#', $served);
    }

    /** UploadedFile real desde un fixture: la validacion mira el contenido, no el nombre. */
    private function fixtureUpload(string $fixture, string $uploadName, string $clientMime): UploadedFile
    {
        return new UploadedFile(base_path("tests/Fixtures/{$fixture}"), $uploadName, $clientMime, null, true);
    }

    public function test_uploads_and_replaces_a_product_image(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create(['company_id' => $this->company->id]);

        $first = $this->postJson("/api/products/{$product->id}/image", [
            'image' => $this->fixtureUpload('pixel.jpg', 'foto.jpg', 'image/jpeg'),
        ])->assertOk()->json('data.image_url');

        $firstPath = explode('/storage/', $first)[1];
        // Carpeta propia de la empresa + nombre generado por el servidor + extension
        // segun el contenido real.
        $this->assertMatchesRegularExpression('#^products/'.$this->company->id.'/[A-Za-z0-9]{40}\.jpg$#', $firstPath);
        Storage::disk('public')->assertExists($firstPath);

        $second = $this->postJson("/api/products/{$product->id}/image", [
            'image' => $this->fixtureUpload('pixel.png', 'otra.png', 'image/png'),
        ])->assertOk()->json('data.image_url');

        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($firstPath);
    }

    public function test_rejects_a_non_image_upload(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create(['company_id' => $this->company->id]);

        $this->postJson("/api/products/{$product->id}/image", [
            'image' => UploadedFile::fake()->create('lista.txt', 10, 'text/plain'),
        ])->assertStatus(422)->assertJsonValidationErrors('image');
    }

    /**
     * AUD-02: la auditoria envio un binario que NO era una imagen presentado
     * como image/png. Antes reventaba en la ruta de finfo -> HTTP 500 con
     * informacion interna. Debe ser un rechazo controlado 422 y sin fugas.
     */
    public function test_a_disguised_non_image_is_rejected_with_422_not_500(): void
    {
        Storage::fake('public');
        $product = Product::factory()->create(['company_id' => $this->company->id]);

        $response = $this->postJson("/api/products/{$product->id}/image", [
            'image' => $this->fixtureUpload('not-an-image.png', 'captura.png', 'image/png'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('image');
        $this->assertArrayNotHasKey('trace', $response->json());
        $this->assertArrayNotHasKey('exception', $response->json());
        $this->assertStringNotContainsString('vendor', $response->getContent());
        $this->assertStringNotContainsString(base_path(), $response->getContent());
        $this->assertNull($product->fresh()->image_url);
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
