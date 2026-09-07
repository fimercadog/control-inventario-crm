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

    /**
     * El filtro de categorias del catalogo se deriva de la BD: solo aparecen
     * categorias que tienen al menos un producto publico y activo. Agregar una
     * categoria nueva con un producto publico la hace aparecer sin tocar el front.
     */
    public function test_categories_are_served_dynamically_from_the_database(): void
    {
        $conProducto = \App\Models\Category::create([
            'company_id' => $this->company->id, 'name' => 'Con producto', 'status' => 'active',
        ]);
        $sinProducto = \App\Models\Category::create([
            'company_id' => $this->company->id, 'name' => 'Sin producto', 'status' => 'active',
        ]);
        $this->publicProduct(['category_id' => $conProducto->id]);

        $this->getJson('/api/public/catalog/categories')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $conProducto->id)
            ->assertJsonPath('0.name', 'Con producto')
            ->assertJsonMissing(['id' => $sinProducto->id]);

        // Nace una categoria nueva con un producto publico -> el filtro la refleja.
        $nueva = \App\Models\Category::create([
            'company_id' => $this->company->id, 'name' => 'Recien creada', 'status' => 'active',
        ]);
        $this->publicProduct(['category_id' => $nueva->id]);

        $this->getJson('/api/public/catalog/categories')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $nueva->id, 'name' => 'Recien creada']);
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

    /**
     * AUD-08: el visitante no controla a que empresa entra su solicitud.
     * `company_id` (y `status`, `client_id`, `owner_id`) del payload se ignoran:
     * la empresa se resuelve del servidor (primera del tenant), no del request.
     */
    public function test_public_quote_request_ignores_company_id_and_other_server_fields_from_payload(): void
    {
        $product = $this->publicProduct();
        $otherCompany = Company::factory()->create(['name' => 'Empresa Ajena']);
        $otherClient = Client::factory()->create(['company_id' => $otherCompany->id]);

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Ana', 'email' => 'ana@empresa.co', 'consent' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            // Campos que el visitante NO debe poder fijar:
            'company_id' => $otherCompany->id,
            'status' => 'accepted',
            'client_id' => $otherClient->id,
            'owner_id' => 999,
        ])->assertCreated();

        $client = Client::where('email', 'ana@empresa.co')->sole();
        $this->assertSame($this->company->id, $client->company_id);
        $this->assertNotSame($otherClient->id, $client->id);

        $quote = Quote::sole();
        $this->assertSame($this->company->id, $quote->company_id);
        $this->assertSame($client->id, $quote->client_id);
        $this->assertSame('draft', $quote->status);
        $this->assertSame('catalog', $quote->source);

        // Nada entro a la empresa ajena.
        $this->assertSame(0, Quote::where('company_id', $otherCompany->id)->count());
        $this->assertSame(1, Client::where('company_id', $otherCompany->id)->count()); // solo el sembrado
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

    /**
     * AUD-04: un contacto NUEVO creado desde el catalogo publico entra como
     * `inactive` (prospecto sin verificar), no infla el conteo de clientes
     * activos. La cotizacion si queda asociada.
     */
    public function test_a_new_client_from_the_public_catalog_is_created_inactive(): void
    {
        $product = $this->publicProduct();

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Prospecto Nuevo', 'email' => 'prospecto@nuevo.co', 'consent' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertCreated();

        $client = Client::where('email', 'prospecto@nuevo.co')->sole();
        $this->assertSame('inactive', $client->status);
        $this->assertSame(1, Quote::where('client_id', $client->id)->count());
    }

    /**
     * AUD-04: si el correo ya pertenece a un cliente existente y activo, la
     * solicitud publica NO lo degrada a inactive ni le pisa los datos.
     */
    public function test_an_existing_active_client_is_not_downgraded_by_a_public_quote_request(): void
    {
        $product = $this->publicProduct();
        $existing = Client::factory()->create([
            'company_id' => $this->company->id,
            'email' => 'cliente@real.co',
            'name' => 'Cliente Real',
            'status' => 'active',
        ]);

        $this->postJson('/api/public/catalog/quote-requests', [
            'name' => 'Otro Nombre Distinto', 'email' => 'cliente@real.co', 'consent' => true,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $existing->refresh();
        $this->assertSame('active', $existing->status);
        $this->assertSame('Cliente Real', $existing->name);
        $this->assertSame(1, Client::where('email', 'cliente@real.co')->count());
        $this->assertSame(1, Quote::where('client_id', $existing->id)->count());
    }

    /**
     * Concurrencia (hallazgo de code-review): el get-or-create del cliente corre
     * FUERA de la transaccion de la cotizacion. Prueba estructural: si la
     * creacion de la Quote falla, la transaccion hace rollback pero el Cliente
     * (creado antes y fuera de ella) persiste. Con el bug anterior — cliente
     * dentro del mismo DB::transaction — el rollback tambien lo habria borrado.
     *
     * Lo que este entorno NO puede reproducir: el snapshot REPEATABLE READ de
     * MySQL/MariaDB que hacia fallar la re-lectura de recuperacion de
     * `firstOrCreate` cuando corria dentro de la transaccion (SQLite en memoria,
     * conexion unica, envuelta por RefreshDatabase). La correccion es
     * estructural — sacar el get-or-create de la transaccion — y esa propiedad
     * es la que verifica este test. La recuperacion ante unique violation la
     * cubre la suite del propio framework (Builder::createOrFirst).
     */
    public function test_client_is_created_outside_the_quote_transaction(): void
    {
        $product = $this->publicProduct();
        $email = 'fuera-de-txn@empresa.co';

        $listenerKey = 'eloquent.creating: '.Quote::class;
        Quote::creating(fn () => throw new \RuntimeException('fallo simulado al crear la cotizacion'));

        try {
            $this->postJson('/api/public/catalog/quote-requests', [
                'name' => 'Ana', 'email' => $email, 'consent' => true,
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ])->assertStatus(500);
        } finally {
            $this->app['events']->forget($listenerKey);
        }

        // El cliente sobrevive al rollback de la cotizacion.
        $this->assertDatabaseHas('clients', ['email' => $email, 'status' => 'inactive']);
        $this->assertSame(0, Quote::count());
    }
}
