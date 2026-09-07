<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

/**
 * AUD-03: el borrado permanente de clientes pasa a exigir su propio permiso
 * `clients.delete` (Ventas conserva `clients.manage` pero ya no hace hard-delete).
 *
 * El seeder crea el permiso en instalaciones nuevas; esta migracion lo
 * backfillea en las existentes y lo concede a los roles administrativos, sin
 * depender de volver a correr el seeder. Idempotente: se puede reejecutar sin
 * duplicar filas.
 */
return new class extends Migration
{
    private const PERMISSION = 'clients.delete';

    /** Mismos roles que reciben "todos" los permisos en el seeder. */
    private const ADMIN_ROLES = ['Super Admin', 'Administrador de empresa'];

    public function up(): void
    {
        $now = now();

        $exists = DB::table('permissions')
            ->where(['name' => self::PERMISSION, 'guard_name' => 'web'])
            ->exists();

        if (! $exists) {
            DB::table('permissions')->insert([
                'name' => self::PERMISSION,
                'guard_name' => 'web',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $permissionId = DB::table('permissions')
            ->where(['name' => self::PERMISSION, 'guard_name' => 'web'])
            ->value('id');

        $roleIds = DB::table('roles')
            ->where('guard_name', 'web')
            ->whereIn('name', self::ADMIN_ROLES)
            ->pluck('id');

        foreach ($roleIds as $roleId) {
            DB::table('role_has_permissions')->updateOrInsert(
                ['permission_id' => $permissionId, 'role_id' => $roleId],
                [],
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $permissionId = DB::table('permissions')
            ->where(['name' => self::PERMISSION, 'guard_name' => 'web'])
            ->value('id');

        if ($permissionId !== null) {
            DB::table('role_has_permissions')->where('permission_id', $permissionId)->delete();
            DB::table('model_has_permissions')->where('permission_id', $permissionId)->delete();
            DB::table('permissions')->where('id', $permissionId)->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
