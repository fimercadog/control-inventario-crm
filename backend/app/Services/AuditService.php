<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public function record(string $action, Model $model, Request $request, ?array $oldValues = null): void
    {
        // `$request->user()` sin guard explícito resuelve al último guard que
        // autenticó el request (`Authenticate::shouldUse`); en una ruta
        // `auth:client` eso es un Client, no un User -- `audit_logs.user_id`
        // referencia `users`, así que un Client ahí rompe la FK (S14). El
        // portal del dueño no tiene "actor staff" que registrar: user_id null.
        $actor = $request->user();
        $staffActor = $actor instanceof User ? $actor : null;

        AuditLog::create([
            'company_id' => $model->company_id ?? $staffActor?->company_id,
            'user_id' => $staffActor?->id,
            'action' => $action,
            'module' => str($model::class)->classBasename()->snake('-')->toString(),
            'entity' => $model::class,
            'entity_id' => $model->getKey(),
            'old_values' => $oldValues ? $this->withoutHidden($model, $oldValues) : null,
            'new_values' => $this->withoutHidden($model, $model->getAttributes()),
            'ip_address' => $request->ip(),
        ]);
    }

    /**
     * No guardar en la auditoría atributos ocultos del modelo (p. ej. el hash
     * de `password` / `remember_token` de User).
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function withoutHidden(Model $model, array $values): array
    {
        return collect($values)->except($model->getHidden())->all();
    }
}
