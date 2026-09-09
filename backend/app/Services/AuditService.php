<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public function record(string $action, Model $model, Request $request, ?array $oldValues = null): void
    {
        AuditLog::create([
            'company_id' => $model->company_id ?? $request->user()?->company_id,
            'user_id' => $request->user()?->id,
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
