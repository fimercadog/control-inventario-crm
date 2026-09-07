<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Aislamiento de archivos de imagen entre empresas (hallazgo de code-review).
 *
 * Las imagenes de producto viven en `products/{companyId}/` y el borrado de la
 * imagen anterior solo se acepta si su ruta esta dentro de la carpeta propia de
 * la empresa. Un `image_url` manipulado (columna de texto libre) apuntando al
 * archivo de otra empresa no puede provocar su borrado.
 */
class ProductImageIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Company $companyA;

    private Company $companyB;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->companyA = Company::factory()->create(['name' => 'Empresa A']);
        $this->companyB = Company::factory()->create(['name' => 'Empresa B']);
        Permission::firstOrCreate(['name' => 'products.manage', 'guard_name' => 'web']);
    }

    private function actingAsCompany(Company $company): void
    {
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('products.manage');
        Sanctum::actingAs($user, ['*']);
    }

    private function pixelJpg(): UploadedFile
    {
        return new UploadedFile(base_path('tests/Fixtures/pixel.jpg'), 'foto.jpg', 'image/jpeg', null, true);
    }

    private function storedPath(string $imageUrl): string
    {
        return explode('/storage/', $imageUrl)[1];
    }

    public function test_a_product_manages_its_own_image(): void
    {
        $this->actingAsCompany($this->companyA);
        $product = Product::factory()->create(['company_id' => $this->companyA->id]);

        $first = $this->storedPath(
            $this->postJson("/api/products/{$product->id}/image", ['image' => $this->pixelJpg()])
                ->assertOk()->json('data.image_url')
        );
        $this->assertStringStartsWith("products/{$this->companyA->id}/", $first);
        Storage::disk('public')->assertExists($first);

        $second = $this->storedPath(
            $this->postJson("/api/products/{$product->id}/image", ['image' => $this->pixelJpg()])
                ->assertOk()->json('data.image_url')
        );

        // La propia imagen anterior si se reemplaza (se borra).
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);
    }

    public function test_upload_cannot_delete_another_companys_product_image(): void
    {
        // Empresa B sube legitimamente la imagen de su producto.
        $this->actingAsCompany($this->companyB);
        $productB = Product::factory()->create(['company_id' => $this->companyB->id]);
        $victimPath = $this->storedPath(
            $this->postJson("/api/products/{$productB->id}/image", ['image' => $this->pixelJpg()])
                ->assertOk()->json('data.image_url')
        );
        Storage::disk('public')->assertExists($victimPath);

        // Empresa A apunta el image_url de su producto al archivo de B y sube uno
        // nuevo. `image_url` no es fillable (no se puede fijar por el payload);
        // forceCreate simula que la columna quedo con un valor manipulado.
        $this->actingAsCompany($this->companyA);
        $productA = Product::factory()->create(['company_id' => $this->companyA->id]);
        $productA->forceFill(['image_url' => '/storage/'.$victimPath])->save();
        $this->postJson("/api/products/{$productA->id}/image", ['image' => $this->pixelJpg()])->assertOk();

        // El archivo de B sigue ahi y su producto conserva su image_url.
        Storage::disk('public')->assertExists($victimPath);
        $this->assertSame('/storage/'.$victimPath, $productB->fresh()->image_url);
    }

    public function test_manipulating_image_url_cannot_delete_foreign_or_arbitrary_files(): void
    {
        $this->actingAsCompany($this->companyA);

        Storage::disk('public')->put("products/{$this->companyB->id}/ajeno.jpg", 'archivo de la empresa B');
        Storage::disk('public')->put('products/legacy-plano.jpg', 'ruta plana vieja compartida');

        foreach (["/storage/products/{$this->companyB->id}/ajeno.jpg", '/storage/products/legacy-plano.jpg'] as $craftedUrl) {
            // `image_url` no es fillable; forceFill simula la columna manipulada.
            $product = Product::factory()->create(['company_id' => $this->companyA->id]);
            $product->forceFill(['image_url' => $craftedUrl])->save();

            $this->postJson("/api/products/{$product->id}/image", ['image' => $this->pixelJpg()])
                ->assertOk()
                ->assertJsonPath('data.image_url', fn ($url) => str_contains((string) $url, "products/{$this->companyA->id}/"));
        }

        Storage::disk('public')->assertExists("products/{$this->companyB->id}/ajeno.jpg");
        Storage::disk('public')->assertExists('products/legacy-plano.jpg');
    }
}
