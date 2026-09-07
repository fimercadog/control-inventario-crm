<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Deal;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ContingencyTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['settings.manage', 'products.manage', 'deals.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
    }

    private function login(array $permissions = []): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo($permissions);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_status_lists_eligible_modules_and_is_readable_by_anyone(): void
    {
        $this->login([]);

        $this->getJson('/api/contingency/status')
            ->assertOk()
            ->assertJsonPath('active', false)
            ->assertJsonPath('modules.0.key', 'products')
            ->assertJsonPath('modules.1.key', 'deals');
    }

    public function test_activate_requires_settings_manage(): void
    {
        $this->login([]);
        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['products']])->assertForbidden();
    }

    public function test_activate_accepts_registered_modules_and_rejects_unknown(): void
    {
        $this->login(['settings.manage']);

        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['products', 'deals']])
            ->assertCreated()
            ->assertJsonPath('active', true);

        // Ya hay una sesion activa.
        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['products']])->assertStatus(409);
    }

    public function test_activate_rejects_a_module_not_in_the_registry(): void
    {
        $this->login(['settings.manage']);
        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['clients']])->assertStatus(422);
    }

    public function test_deactivate_without_active_session_returns_409(): void
    {
        $this->login(['settings.manage']);
        $this->postJson('/api/contingency/deactivate')->assertStatus(409);
    }

    public function test_contingency_create_is_idempotent_by_client_uuid(): void
    {
        $this->login(['products.manage']);
        $uuid = (string) Str::uuid();

        $payload = [
            'sku' => 'OFF-1', 'name' => 'Producto offline', 'status' => 'active',
            'unit_price' => 10, 'cost_price' => 5, 'reorder_level' => 1, 'client_uuid' => $uuid,
        ];

        $this->postJson('/api/products', $payload)->assertCreated();
        $this->postJson('/api/products', $payload)->assertCreated(); // reintento

        $this->assertSame(1, Product::where('client_uuid', $uuid)->count());
    }

    public function test_contingency_update_detects_a_conflict_against_the_base_snapshot(): void
    {
        $this->login(['products.manage']);
        $product = Product::factory()->create(['company_id' => $this->company->id, 'name' => 'Actual', 'unit_price' => 100]);

        // El servidor ya tiene name = "Actual"; el snapshot base decia "Viejo".
        $this->putJson("/api/products/{$product->id}", [
            'name' => 'Editado offline',
            'base_snapshot' => ['name' => 'Viejo'],
        ])->assertStatus(409)->assertJsonPath('conflict', true)->assertJsonPath('fields.name.server', 'Actual');

        // Con force se aplica igual (resolver de conflictos).
        $this->putJson("/api/products/{$product->id}", [
            'name' => 'Editado offline', 'base_snapshot' => ['name' => 'Viejo'], 'force' => true,
        ])->assertOk()->assertJsonPath('data.name', 'Editado offline');
    }

    public function test_contingency_update_does_not_flag_an_unchanged_date_as_a_conflict(): void
    {
        $this->login(['deals.manage']);
        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $deal = Deal::factory()->create([
            'company_id' => $this->company->id, 'client_id' => $client->id,
            'title' => 'Trato', 'expected_close_date' => '2026-09-16',
        ]);

        // El snapshot base trae la fecha como la serializo el Resource; el servidor
        // no la cambio -> no debe haber conflicto.
        $this->putJson("/api/deals/{$deal->id}", [
            'title' => 'Trato editado offline',
            'base_snapshot' => ['title' => 'Trato', 'expected_close_date' => '2026-09-16'],
        ])->assertOk()->assertJsonPath('data.title', 'Trato editado offline');
    }

    public function test_contingency_update_applies_when_snapshot_matches_server(): void
    {
        $this->login(['products.manage']);
        $product = Product::factory()->create(['company_id' => $this->company->id, 'name' => 'Igual']);

        $this->putJson("/api/products/{$product->id}", [
            'name' => 'Nuevo', 'base_snapshot' => ['name' => 'Igual'],
        ])->assertOk()->assertJsonPath('data.name', 'Nuevo');
    }
}
