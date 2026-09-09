<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends BaseCrudController
{
    protected string $model = User::class;

    protected string $resource = UserResource::class;

    protected array $searchable = ['name', 'email'];

    protected array $filterable = ['status' => 'status'];

    public function store(Request $request, AuditService $audit)
    {
        // La firma la fija BaseCrudController (Request). Resolvemos el FormRequest
        // desde el contenedor: valida al construirse y whitelistea los campos.
        $data = app(StoreUserRequest::class)->validated();

        $temporaryPassword = null;
        $password = $data['password'] ?? null;
        if (! $password) {
            $temporaryPassword = Str::password(12);
            $password = $temporaryPassword;
        }

        // company_id se fija en el servidor, nunca desde el payload.
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'status' => $data['status'],
            'password' => $password,
            'company_id' => $this->companyId($request),
        ]);

        if (! empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        $user->load($this->with);
        $audit->record('created', $user, $request);

        $response = (new UserResource($user))->response()->setStatusCode(201);
        if ($temporaryPassword) {
            $response->setData(['data' => $response->getData()->data, 'temporary_password' => $temporaryPassword]);
        }

        return $response;
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        $user = User::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        $oldValues = $user->getOriginal();

        $data = app(UpdateUserRequest::class)->validated();
        $attributes = collect($data)->only(['name', 'email', 'status'])->all();
        if (! empty($data['password'])) {
            $attributes['password'] = $data['password'];
        }

        // Nunca se toca company_id en update.
        $user->update($attributes);

        if (! empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        $user->load($this->with);
        $audit->record('updated', $user, $request, $oldValues);

        return new UserResource($user);
    }
}
