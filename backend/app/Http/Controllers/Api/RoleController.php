<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request, TableQueryService $tables)
    {
        $query = Role::query()->with('permissions');
        $tables->apply($request, $query, ['name'], ['status' => 'status']);

        return RoleResource::collection($query->paginate(min((int) $request->input('per_page', 10), 100)));
    }

    public function show(string $id)
    {
        return new RoleResource(Role::with('permissions')->findOrFail($id));
    }

    public function store(Request $request, AuditService $audit)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:active,inactive'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [Rule::exists('permissions', 'name')],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
            'status' => $data['status'],
        ]);
        $role->syncPermissions($data['permissions'] ?? []);
        $audit->record('created', $role, $request);

        return (new RoleResource($role->load('permissions')))->response()->setStatusCode(201);
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        $role = Role::findOrFail($id);
        $oldValues = $role->getOriginal();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', 'in:active,inactive'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [Rule::exists('permissions', 'name')],
        ]);

        $role->update(collect($data)->only(['name', 'status'])->all());
        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions']);
        }
        $audit->record('updated', $role, $request, $oldValues);

        return new RoleResource($role->load('permissions'));
    }

    /** Catalogo de permisos disponibles, para el checklist de armado de roles. Gated por can:roles.manage en la ruta. */
    public function permissions()
    {
        return response()->json(['data' => Permission::query()->orderBy('name')->pluck('name')]);
    }
}
