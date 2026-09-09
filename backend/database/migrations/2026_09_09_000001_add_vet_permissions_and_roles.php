<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

/**
 * S1 de la vertical veterinaria: catálogo de permisos clínicos + roles
 * "Veterinario/a" y "Recepción".
 *
 * El seeder los define para instalaciones nuevas; esta migración los backfillea
 * en las existentes sin depender de re-correr el seeder. Idempotente.
 */
return new class extends Migration
{
    /** @var list<string> */
    private const PERMISSIONS = [
        'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
        'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
    ];

    /** Roles que reciben "todos" los permisos en el seeder. */
    private const ADMIN_ROLES = ['Super Admin', 'Administrador de empresa'];

    /** @var array<string, list<string>> rol => permisos (para instalaciones existentes) */
    private const VET_ROLES = [
        'Veterinario/a' => [
            'dashboard.view', 'clients.manage', 'orders.manage', 'reports.view',
            'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
        ],
        'Recepción' => [
            'dashboard.view', 'clients.manage', 'patients.manage', 'services.manage',
            'appointments.manage', 'orders.manage', 'reports.view',
        ],
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::PERMISSIONS as $name) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name, 'guard_name' => 'web'],
                ['updated_at' => $now, 'created_at' => $now],
            );
        }

        $permissionId = fn (string $name) => DB::table('permissions')
            ->where(['name' => $name, 'guard_name' => 'web'])->value('id');

        $grant = function (int $roleId, array $permissionNames) use ($permissionId): void {
            foreach ($permissionNames as $name) {
                $pid = $permissionId($name);
                if ($pid === null) {
                    continue; // el permiso base aún no existe (lo crea el seeder); se salta
                }
                DB::table('role_has_permissions')->updateOrInsert(
                    ['permission_id' => $pid, 'role_id' => $roleId],
                    [],
                );
            }
        };

        // Los 8 permisos clínicos a los roles administrativos existentes.
        $adminRoleIds = DB::table('roles')->where('guard_name', 'web')
            ->whereIn('name', self::ADMIN_ROLES)->pluck('id');
        foreach ($adminRoleIds as $roleId) {
            $grant((int) $roleId, self::PERMISSIONS);
        }

        // Roles nuevos + sus permisos (para instalaciones existentes; en las
        // nuevas el seeder los sincroniza igual).
        foreach (self::VET_ROLES as $roleName => $permissions) {
            DB::table('roles')->updateOrInsert(
                ['name' => $roleName, 'guard_name' => 'web'],
                ['status' => 'active', 'updated_at' => $now, 'created_at' => $now],
            );
            $roleId = (int) DB::table('roles')->where(['name' => $roleName, 'guard_name' => 'web'])->value('id');
            $grant($roleId, $permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        DB::table('roles')->where('guard_name', 'web')
            ->whereIn('name', array_keys(self::VET_ROLES))->delete();

        $permissionIds = DB::table('permissions')->where('guard_name', 'web')
            ->whereIn('name', self::PERMISSIONS)->pluck('id');

        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('model_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
