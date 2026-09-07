<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Product;
use App\Models\Quote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
    }

    private function publicProduct(array $attrs = []): Product
    {
        return Product::factory()->create($attrs + [
            'company_id' => $this->company->id,
            'is_public' => true,
            'status' => 'active',
            'unit_price' => 1000,
        ]);
    }

    public function test_catalog_lists_only_public_active_products_without_cost(): void
    {
        $public = $this->publicProduct(['name' => 'Silla', 'cost_price' => 500]);
        $this->publicProduct(['is_public' => false, 'name' => 'Interno']);
        $this->publicProduct(['status' => 'inactive', 'name' => 'Descontinuado']);

        $res = $this->getJson('/api/public/catalog/products')->assertOk();

        $res->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $public->id)
            ->assertJsonPath('data.0.unit_price', '1000.00')
            ->assertJsonMissingPath('data.0.cost_price')
            ->assertJsonMissingPath('data.0.reorder_level');
    }

    public function test_catalog_survives_a_degenerate_per_page(): void
    {
        $this->publicProduct();

        $this->getJson('/api/public/catalog/products?per_page=0')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/public/catalog/products?per_page=-5')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_non_public_product_detail_is_not_found(): void
    {
        $hidden = $this->publicProduct(['is_public' => false]);

        $this->getJson("/api/public/catalog/products/{$hidden->id}")->assertNotFound();
    }

    public function test_quote_request_creates_client_and_draft_quote_with_line_snapshots(): void
    {
        $a = $this->publicProduct(['name' => 'Teclado', 'sku' => 'K-1', 'unit_price' => 200]);
        $b = $this->publicProduct(['name' => 'Mouse', 'sku' => 'M-1', 'unit_price' => 50]);

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana Prueba',
            'email' => 'ana@empresa.co',
            'phone' => '3000000000',
            'company_name' => 'Empresa Ana',
            'message' => 'Necesito precios por volumen',
            'consent' => true,
            'items' => [
                ['product_id' => $a->id, 'quantity' => 3],
                ['product_id' => $b->id, 'quantity' => 2],
            ],
        ])->assertCreated();

        $this->assertSame(1, Client::where('company_id', $this->company->id)->count());

        $quote = Quote::first();
        $this->assertSame('draft', $quote->status);
        $this->assertSame('catalog', $quote->source);
        $this->assertSame('700.00', (string) $quote->total); // 3*200 + 2*50
        $this->assertSame(2, $quote->items()->count());
        $this->assertDatabaseHas('quote_items', [
            'quote_id' => $quote->id, 'product_name' => 'Teclado', 'sku' => 'K-1',
            'quantity' => 3, 'unit_price' => 200,
        ]);
    }

    public function test_browsing_the_catalog_does_not_consume_the_quote_quota(): void
    {
        $product = $this->publicProduct();

        // Navegar bastante (mas que el limite de cotizaciones) no debe bloquear el envio.
        for ($i = 0; $i < 12; $i++) {
            $this->getJson('/api/public/catalog/products')->assertOk();
        }

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana', 'email' => 'ana@empresa.co', 'consent' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
    }

    public function test_quote_request_requires_consent(): void
    {
        $product = $this->publicProduct();

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana', 'email' => 'ana@empresa.co',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('consent');
    }

    public function test_quote_request_rejects_repeated_product_lines(): void
    {
        $product = $this->publicProduct();

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana', 'email' => 'ana@empresa.co', 'consent' => true,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors('items.0.product_id');
    }

    public function test_quote_request_rejects_non_public_product(): void
    {
        $hidden = $this->publicProduct(['is_public' => false]);

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana', 'email' => 'ana@empresa.co', 'consent' => true,
            'items' => [['product_id' => $hidden->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('items.0.product_id');
    }

    public function test_repeat_request_does_not_duplicate_client(): void
    {
        $product = $this->publicProduct();
        $payload = [
            'name' => 'Ana', 'email' => 'ana@empresa.co', 'consent' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ];

        $this->postJson('/api/public/catalog/quote-requests', $payload)->assertCreated();
        $this->postJson('/api/public/catalog/quote-requests', $payload)->assertCreated();

        $this->assertSame(1, Client::where('email', 'ana@empresa.co')->count());
        $this->assertSame(2, Quote::count());
    }
}
