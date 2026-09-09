<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Alta/edición de usuarios del panel. El punto crítico: `company_id` y otros
 * campos sensibles no deben poder llegar por el payload (mass-assignment).
 */
class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Company $otherCompany;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'Mi Empresa']);
        $this->otherCompany = Company::factory()->create(['name' => 'Otra Empresa']);

        foreach (['users.manage', 'clients.manage'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        Role::firstOrCreate(['name' => 'Ventas', 'guard_name' => 'web']);

        $admin = User::factory()->create(['company_id' => $this->company->id]);
        $admin->givePermissionTo('users.manage');
        Sanctum::actingAs($admin, ['*']);
    }

    public function test_requires_users_manage_permission(): void
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/users', [
            'name' => 'X', 'email' => 'x@example.com', 'status' => 'active',
        ])->assertForbidden();
    }

    public function test_creates_user_with_temporary_password(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'Nueva Persona',
            'email' => 'nueva@example.com',
            'status' => 'active',
            'role' => 'Ventas',
        ])->assertCreated();

        $response->assertJsonPath('data.email', 'nueva@example.com');
        $response->assertJsonPath('data.role', 'Ventas');
        $this->assertNotEmpty($response->json('temporary_password'));

        $this->assertDatabaseHas('users', [
            'email' => 'nueva@example.com',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_company_id_in_payload_is_ignored_on_create(): void
    {
        $this->postJson('/api/users', [
            'name' => 'Intruso',
            'email' => 'intruso@example.com',
            'status' => 'active',
            'company_id' => $this->otherCompany->id,
        ])->assertCreated();

        // Aterriza en la empresa del actor, no en la del payload.
        $this->assertDatabaseHas('users', [
            'email' => 'intruso@example.com',
            'company_id' => $this->company->id,
        ]);
        $this->assertDatabaseMissing('users', [
            'email' => 'intruso@example.com',
            'company_id' => $this->otherCompany->id,
        ]);
    }

    public function test_company_id_in_payload_is_ignored_on_update(): void
    {
        $target = User::factory()->create([
            'company_id' => $this->company->id,
            'email' => 'target@example.com',
        ]);

        $this->putJson("/api/users/{$target->id}", [
            'name' => 'Nombre Editado',
            'company_id' => $this->otherCompany->id,
        ])->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Nombre Editado',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_edit_user_of_another_company(): void
    {
        $foreign = User::factory()->create(['company_id' => $this->otherCompany->id]);

        $this->putJson("/api/users/{$foreign->id}", ['name' => 'Hackeado'])
            ->assertNotFound();
    }

    public function test_invalid_status_is_rejected(): void
    {
        $this->postJson('/api/users', [
            'name' => 'X',
            'email' => 'x@example.com',
            'status' => 'super-admin',
        ])->assertStatus(422)->assertJsonValidationErrors('status');
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'taken@example.com', 'company_id' => $this->company->id]);

        $this->postJson('/api/users', [
            'name' => 'X',
            'email' => 'taken@example.com',
            'status' => 'active',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_unknown_role_is_rejected(): void
    {
        $this->postJson('/api/users', [
            'name' => 'X',
            'email' => 'x@example.com',
            'status' => 'active',
            'role' => 'Rol Que No Existe',
        ])->assertStatus(422)->assertJsonValidationErrors('role');
    }

    public function test_password_when_supplied_must_be_at_least_8_chars(): void
    {
        $this->postJson('/api/users', [
            'name' => 'X',
            'email' => 'x@example.com',
            'status' => 'active',
            'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_supplied_password_takes_effect_and_no_temporary_password_is_returned(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'Con Clave',
            'email' => 'conclave@example.com',
            'status' => 'active',
            'password' => 'mi-clave-segura',
        ])->assertCreated();

        $this->assertArrayNotHasKey('temporary_password', $response->json());

        $user = User::where('email', 'conclave@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('mi-clave-segura', $user->password));
    }

    public function test_updating_a_user_with_their_own_unchanged_email_is_allowed(): void
    {
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'email' => 'mismo@example.com',
        ]);

        // El Rule::unique()->ignore() debe excluir al propio usuario.
        $this->putJson("/api/users/{$user->id}", [
            'name' => 'Nombre Nuevo',
            'email' => 'mismo@example.com',
        ])->assertOk()->assertJsonPath('data.name', 'Nombre Nuevo');
    }

    public function test_audit_log_does_not_store_the_password_hash(): void
    {
        $this->postJson('/api/users', [
            'name' => 'Auditado',
            'email' => 'auditado@example.com',
            'status' => 'active',
        ])->assertCreated();

        $log = AuditLog::where('entity', User::class)->latest('id')->firstOrFail();
        $this->assertArrayNotHasKey('password', (array) $log->new_values);
        $this->assertArrayNotHasKey('remember_token', (array) $log->new_values);
    }
}
