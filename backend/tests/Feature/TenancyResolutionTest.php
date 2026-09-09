<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Resolución de la empresa del request (`ResolvesCompany`). El `?? 1` viejo
 * inventaba un tenant inexistente con la tabla vacía; ahora falla fuerte.
 */
class TenancyResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_request_with_no_company_configured_fails_hard(): void
    {
        // Sin ninguna Company en la base, un request público que necesita
        // resolver el tenant debe abortar (500 = instalación rota), no adivinar id 1.
        $this->getJson('/api/public/catalog/products')
            ->assertStatus(500);
    }

    public function test_authenticated_user_resolves_to_own_company(): void
    {
        $mine = Company::factory()->create(['name' => 'Mía']);
        Company::factory()->create(['name' => 'Ajena']); // ruido: no debe elegirse

        $user = User::factory()->create(['company_id' => $mine->id]);
        $user->givePermissionTo(Permission::firstOrCreate([
            'name' => 'clients.manage', 'guard_name' => 'web',
        ]));
        Sanctum::actingAs($user, ['*']);

        // Crear un cliente y verificar que quedó en la empresa del usuario.
        $this->postJson('/api/clients', ['name' => 'Cliente', 'status' => 'active'])
            ->assertCreated();

        $this->assertDatabaseHas('clients', ['name' => 'Cliente', 'company_id' => $mine->id]);
    }
}
