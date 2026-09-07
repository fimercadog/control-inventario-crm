<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\Product;
use App\Models\Quote;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Client $client;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['deals.manage', 'orders.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['deals.manage', 'orders.manage']);
        Sanctum::actingAs($user, ['*']);

        $this->client = Client::factory()->create(['company_id' => $this->company->id]);
        $this->product = Product::factory()->create(['company_id' => $this->company->id, 'unit_price' => 100]);
        Warehouse::factory()->create(['company_id' => $this->company->id]);
    }

    public function test_full_quote_lifecycle_to_order(): void
    {
        $quote = $this->postJson('/api/quotes', ['title' => 'Propuesta', 'client_id' => $this->client->id])
            ->assertCreated()->json('data');

        $this->postJson("/api/quotes/{$quote['id']}/items", [
            'product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100,
        ])->assertOk()->assertJsonPath('data.total', '300.00');

        $this->postJson("/api/quotes/{$quote['id']}/send")->assertOk()->assertJsonPath('data.status', 'sent');
        $this->postJson("/api/quotes/{$quote['id']}/respond", ['decision' => 'accepted'])
            ->assertOk()->assertJsonPath('data.status', 'accepted');

        $res = $this->postJson("/api/quotes/{$quote['id']}/convert")->assertCreated();
        $orderId = $res->json('order_id');

        $this->assertNotNull($orderId);
        $this->assertSame(1, Order::where('client_id', $this->client->id)->count());
        $this->assertSame('300.00', (string) Order::find($orderId)->total);
        // El pedido convertido queda a nombre de quien lo convirtio (si no, no
        // aparece en el reporte comercial por vendedor).
        $this->assertNotNull(Order::find($orderId)->owner_id);
    }

    public function test_convert_is_blocked_when_a_line_lost_its_product(): void
    {
        $quote = Quote::create(['company_id' => $this->company->id, 'client_id' => $this->client->id, 'title' => 'X', 'status' => 'accepted']);
        $quote->items()->create([
            'product_id' => null, 'product_name' => 'Producto borrado', 'sku' => 'GONE-1',
            'quantity' => 2, 'unit_price' => 50,
        ]);

        $this->postJson("/api/quotes/{$quote->id}/convert")->assertStatus(422);
        $this->assertNull($quote->fresh()->converted_order_id);
    }

    public function test_cannot_send_an_empty_quote(): void
    {
        $quote = Quote::create(['company_id' => $this->company->id, 'client_id' => $this->client->id, 'title' => 'Vacia', 'status' => 'draft']);
        $this->postJson("/api/quotes/{$quote->id}/send")->assertStatus(422);
    }

    public function test_convert_needs_orders_permission(): void
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('deals.manage');
        Sanctum::actingAs($user, ['*']);

        $quote = Quote::create(['company_id' => $this->company->id, 'client_id' => $this->client->id, 'title' => 'X', 'status' => 'accepted']);
        $quote->items()->create(['product_id' => $this->product->id, 'quantity' => 1, 'unit_price' => 10]);

        $this->postJson("/api/quotes/{$quote->id}/convert")->assertForbidden();
    }
}
