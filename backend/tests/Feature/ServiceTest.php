<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S4 — catálogo de servicios veterinarios (entidad propia, ≠ Product).
 */
class ServiceTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        Permission::firstOrCreate(['name' => 'services.manage', 'guard_name' => 'web']);

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('services.manage');
        Sanctum::actingAs($user, ['*']);
    }

    public function test_requires_services_manage_permission(): void
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/services')->assertForbidden();
    }

    public function test_creates_a_service_with_price_and_duration(): void
    {
        $this->postJson('/api/services', [
            'name' => 'Consulta general',
            'type' => 'consulta',
            'estimated_duration_minutes' => 30,
            'price' => 45000,
            'status' => 'active',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Consulta general')
            ->assertJsonPath('data.estimated_duration_minutes', 30);

        $this->assertDatabaseHas('services', ['name' => 'Consulta general', 'company_id' => $this->company->id]);
    }

    public function test_negative_price_is_rejected(): void
    {
        $this->postJson('/api/services', ['name' => 'X', 'price' => -1, 'status' => 'active'])
            ->assertStatus(422)->assertJsonValidationErrors('price');
    }

    public function test_unknown_type_is_rejected(): void
    {
        $this->postJson('/api/services', ['name' => 'X', 'price' => 0, 'type' => 'inventado', 'status' => 'active'])
            ->assertStatus(422)->assertJsonValidationErrors('type');
    }

    public function test_name_is_unique_per_company(): void
    {
        Service::create(['company_id' => $this->company->id, 'name' => 'Cirugía', 'price' => 0, 'status' => 'active']);

        $this->postJson('/api/services', ['name' => 'Cirugía', 'price' => 0, 'status' => 'active'])
            ->assertStatus(422)->assertJsonValidationErrors('name');
    }

    public function test_services_are_isolated_by_company(): void
    {
        $foreign = Service::create([
            'company_id' => Company::factory()->create(['name' => fake()->company()])->id,
            'name' => 'Ajeno', 'price' => 0, 'status' => 'active',
        ]);

        $this->getJson("/api/services/{$foreign->id}")->assertNotFound();
    }
}
