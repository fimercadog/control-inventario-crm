<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/**
 * AUD-03: el rol Ventas puede crear y editar clientes (clients.manage) pero
 * NO puede hacer hard-delete. El borrado permanente exige clients.delete, que
 * solo tienen los roles administrativos.
 */
class ClientDeletionPermissionTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['clients.manage', 'clients.delete', 'deals.manage'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }

    private function actingAsRole(string $role, array $permissions): User
    {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web'])->syncPermissions($permissions);
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->assignRole($role);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_ventas_can_create_and_edit_clients(): void
    {
        $this->actingAsRole('Ventas', ['clients.manage', 'deals.manage']);

        $id = $this->postJson('/api/clients', ['name' => 'ACME', 'status' => 'active'])
            ->assertCreated()->json('data.id');

        $this->putJson("/api/clients/{$id}", ['name' => 'ACME S.A.', 'status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.name', 'ACME S.A.');
    }

    public function test_ventas_cannot_hard_delete_a_client(): void
    {
        $this->actingAsRole('Ventas', ['clients.manage', 'deals.manage']);
        $client = Client::factory()->create(['company_id' => $this->company->id]);

        $this->deleteJson("/api/clients/{$client->id}")->assertForbidden();

        $this->assertDatabaseHas('clients', ['id' => $client->id]);
    }

    public function test_admin_role_with_clients_delete_can_hard_delete_a_client_without_history(): void
    {
        $this->actingAsRole('Administrador de empresa', ['clients.manage', 'clients.delete', 'deals.manage']);
        $client = Client::factory()->create(['company_id' => $this->company->id]);

        $this->deleteJson("/api/clients/{$client->id}")->assertNoContent();

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    public function test_admin_hard_delete_of_a_client_with_history_is_a_clean_422(): void
    {
        $this->actingAsRole('Administrador de empresa', ['clients.manage', 'clients.delete', 'deals.manage']);
        $client = Client::factory()->create(['company_id' => $this->company->id]);
        // orders.client_id es RESTRICT (2026_09_06_000009): un pedido bloquea el borrado.
        Order::create([
            'company_id' => $this->company->id,
            'client_id' => $client->id,
            'warehouse_id' => Warehouse::factory()->create(['company_id' => $this->company->id])->id,
            'status' => 'draft',
            'total' => 0,
        ]);

        $this->deleteJson("/api/clients/{$client->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'No se puede eliminar: hay registros historicos que dependen de este. Marcalo como inactivo.');

        $this->assertDatabaseHas('clients', ['id' => $client->id]);
    }

    /**
     * AUD-03: una instalacion existente (roles ya sembrados) que recibe esta
     * actualizacion obtiene `clients.delete` para los roles administrativos via
     * la migracion de backfill, sin re-ejecutar el seeder. Ventas no lo recibe.
     */
    public function test_backfill_migration_grants_clients_delete_to_admin_roles_only(): void
    {
        $registrar = app(PermissionRegistrar::class);

        // Estado "instalacion sembrada, antes de esta migracion".
        Permission::where(['name' => 'clients.delete', 'guard_name' => 'web'])->delete();
        foreach (['Super Admin', 'Administrador de empresa', 'Ventas'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }
        Role::findByName('Ventas', 'web')->givePermissionTo('clients.manage');
        $registrar->forgetCachedPermissions();

        $this->assertNotContains('clients.delete', Role::findByName('Super Admin', 'web')->getPermissionNames()->all());

        // Correr solo la migracion de backfill.
        (require database_path('migrations/2026_09_07_000004_add_clients_delete_permission.php'))->up();
        $registrar->forgetCachedPermissions();

        $this->assertContains('clients.delete', Role::findByName('Super Admin', 'web')->getPermissionNames()->all());
        $this->assertContains('clients.delete', Role::findByName('Administrador de empresa', 'web')->getPermissionNames()->all());
        $this->assertNotContains('clients.delete', Role::findByName('Ventas', 'web')->getPermissionNames()->all());
        $this->assertContains('clients.manage', Role::findByName('Ventas', 'web')->getPermissionNames()->all());

        // Idempotente: re-ejecutar no rompe ni duplica.
        (require database_path('migrations/2026_09_07_000004_add_clients_delete_permission.php'))->up();
        $registrar->forgetCachedPermissions();
        $this->assertSame(1, Permission::where('name', 'clients.delete')->count());
    }
}
