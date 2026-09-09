<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * S1 — catálogo de permisos clínicos y roles de la vertical veterinaria.
 * El seeder los define; la migración `2026_09_09_000001_add_vet_permissions_and_roles`
 * los backfillea en instalaciones existentes.
 */
class VetPermissionsTest extends TestCase
{
    use RefreshDatabase;

    private const VET_PERMISSIONS = [
        'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
        'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_permissions_catalog_lists_the_vet_permissions(): void
    {
        $admin = User::where('email', 'admin@vetlosandes.co')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $data = $this->getJson('/api/permissions')->assertOk()->json('data');

        foreach (self::VET_PERMISSIONS as $permission) {
            $this->assertContains($permission, $data, "Falta el permiso {$permission}");
        }
    }

    public function test_vet_role_has_the_clinical_permissions(): void
    {
        $vet = Role::where('name', 'Veterinario/a')->where('guard_name', 'web')->first();

        $this->assertNotNull($vet, 'El rol Veterinario/a no existe');
        foreach (self::VET_PERMISSIONS as $permission) {
            $this->assertTrue($vet->hasPermissionTo($permission), "Veterinario/a debería tener {$permission}");
        }
    }

    public function test_reception_role_manages_the_front_desk_but_not_clinical_records(): void
    {
        $reception = Role::where('name', 'Recepción')->where('guard_name', 'web')->first();

        $this->assertNotNull($reception, 'El rol Recepción no existe');
        $this->assertTrue($reception->hasPermissionTo('appointments.manage'));
        $this->assertTrue($reception->hasPermissionTo('patients.manage'));
        $this->assertTrue($reception->hasPermissionTo('services.manage'));
        $this->assertFalse($reception->hasPermissionTo('medical_records.manage'));
        $this->assertFalse($reception->hasPermissionTo('prescriptions.manage'));
    }

    public function test_admin_roles_get_the_clinical_permissions_too(): void
    {
        foreach (['Super Admin', 'Administrador de empresa'] as $roleName) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->firstOrFail();
            foreach (self::VET_PERMISSIONS as $permission) {
                $this->assertTrue($role->hasPermissionTo($permission), "{$roleName} debería tener {$permission}");
            }
        }
    }
}
