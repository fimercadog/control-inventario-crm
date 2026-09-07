<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * El cliente dueño de la empresa (Administrador de empresa / Super Admin)
 * necesita poder crear roles propios y asignarles permisos reales, no solo
 * un nombre vacio de permisos.
 */
class RolePermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Company::factory()->create(['name' => 'Test SA']);
        foreach (['roles.manage', 'clients.manage', 'orders.manage'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $user = User::factory()->create();
        $user->givePermissionTo('roles.manage');
        Sanctum::actingAs($user, ['*']);
    }

    public function test_permissions_catalog_is_listable(): void
    {
        $data = $this->getJson('/api/permissions')->assertOk()->json('data');

        // `clients.delete` lo backfillea su migracion (AUD-03), no el setUp: si el
        // catalogo lo lista, la migracion corrio y el permiso esta disponible.
        foreach (['clients.delete', 'clients.manage', 'orders.manage', 'roles.manage'] as $permission) {
            $this->assertContains($permission, $data);
        }
    }

    public function test_creating_a_role_can_assign_permissions_immediately(): void
    {
        $response = $this->postJson('/api/roles', [
            'name' => 'Ventas Junior',
            'status' => 'active',
            'permissions' => ['clients.manage'],
        ])->assertCreated();

        $roleId = $response->json('data.id');
        $this->getJson("/api/roles/{$roleId}")
            ->assertOk()
            ->assertJsonPath('data.permissions', ['clients.manage']);
    }

    public function test_updating_a_role_resyncs_its_permissions(): void
    {
        $roleId = $this->postJson('/api/roles', ['name' => 'Ventas Junior', 'status' => 'active'])->json('data.id');

        $this->putJson("/api/roles/{$roleId}", ['permissions' => ['clients.manage', 'orders.manage']])->assertOk();

        $this->getJson("/api/roles/{$roleId}")
            ->assertOk()
            ->assertJsonPath('data.permissions_count', 2);

        // Volver a sincronizar con una lista mas chica reemplaza, no acumula.
        $this->putJson("/api/roles/{$roleId}", ['permissions' => ['clients.manage']])->assertOk();
        $this->getJson("/api/roles/{$roleId}")->assertJsonPath('data.permissions_count', 1);
    }

    public function test_invalid_permission_name_is_rejected(): void
    {
        $this->postJson('/api/roles', [
            'name' => 'Rol Invalido',
            'status' => 'active',
            'permissions' => ['no.existe'],
        ])->assertStatus(422)->assertJsonValidationErrors('permissions.0');
    }
}
