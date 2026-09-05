<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CrudValidationTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['clients.manage', 'products.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['clients.manage', 'products.manage']);
        Sanctum::actingAs($user, ['*']);
    }

    public function test_rejects_garbage_client_payload(): void
    {
        $this->postJson('/api/clients', [
            'name' => '',
            'email' => 'no-es-un-correo',
            'status' => 'nope',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'status']);
    }

    public function test_accepts_a_valid_client(): void
    {
        $this->postJson('/api/clients', [
            'name' => 'Ana Maria Perez',
            'company_name' => 'Constructora Alfa',
            'email' => 'ana@constructoraalfa.co',
            'status' => 'active',
        ])->assertCreated();
    }

    public function test_partial_update_still_works_for_status_toggle(): void
    {
        $client = Client::factory()->create(['company_id' => $this->company->id, 'status' => 'active']);

        $this->putJson("/api/clients/{$client->id}", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }

    public function test_product_module_is_also_validated(): void
    {
        $this->postJson('/api/products', ['sku' => '', 'name' => '', 'status' => 'nope'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sku', 'name', 'unit', 'unit_price', 'cost_price', 'reorder_level', 'status']);
    }
}
