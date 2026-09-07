<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

/**
 * Sincronizacion de transacciones encoladas en modo contingencia.
 *
 * El cliente reenvia la transaccion por el endpoint real del modulo, mas:
 *  - `client_uuid`: clave de idempotencia -> un reintento no duplica el alta.
 *  - `base_snapshot`: como se veia el registro cuando empezo la contingencia.
 *    Si el servidor cambio respecto a ese snapshot, alguien mas lo edito
 *    mientras el usuario estaba offline -> 409 con las tres versiones.
 *  - `force: true`: aplica sin comprobar (lo envia el resolver de conflictos).
 */
trait HandlesContingencySync
{
    /** Cache por tabla: ¿el modelo tiene columna `client_uuid`? Evita un round-trip a information_schema en cada alta. */
    private static array $contingencyUuidSupport = [];

    /** ¿La request trae una clave de idempotencia de contingencia? */
    protected function contingencyUuid(Request $request): ?string
    {
        $uuid = $request->input('client_uuid');

        return is_string($uuid) && $uuid !== '' ? $uuid : null;
    }

    /** Alta idempotente si el modelo soporta `client_uuid`. Devuelve null si no aplica. */
    protected function contingencyFirstOrCreate(Request $request, array $payload): ?Model
    {
        $uuid = $this->contingencyUuid($request);

        if ($uuid === null) {
            return null;
        }

        $table = (new $this->model)->getTable();
        $supportsUuid = self::$contingencyUuidSupport[$table] ??= Schema::hasColumn($table, 'client_uuid');

        if (! $supportsUuid) {
            return null;
        }

        return ($this->model)::firstOrCreate(
            ['company_id' => $payload['company_id'], 'client_uuid' => $uuid],
            $payload,
        );
    }

    /**
     * Detecta conflicto en una edicion de contingencia.
     *
     * @return array<string,array{server:mixed,base:mixed}>|null campos en conflicto, o null si no hay conflicto / no aplica
     */
    protected function contingencyConflict(Request $request, Model $model): ?array
    {
        $snapshot = $request->input('base_snapshot');

        if ($request->boolean('force') || ! is_array($snapshot)) {
            return null;
        }

        $watched = array_intersect(array_keys($snapshot), $model->getFillable());
        $conflicts = [];

        foreach ($watched as $field) {
            $serverValue = $model->getAttribute($field);
            if (! $this->contingencyValuesMatch($serverValue, $snapshot[$field])) {
                $conflicts[$field] = ['server' => $serverValue, 'base' => $snapshot[$field]];
            }
        }

        return $conflicts === [] ? null : $conflicts;
    }

    /**
     * ¿Son el mismo valor el del servidor y el del snapshot base?
     *
     * Las fechas se comparan como instantes: el snapshot llega serializado por el
     * Resource (ISO8601 con hora) mientras el servidor devuelve un Carbon, asi que
     * un `(string)` a secas marcaria conflicto en cada edicion con fecha.
     */
    private function contingencyValuesMatch(mixed $server, mixed $base): bool
    {
        if ($server instanceof \DateTimeInterface) {
            try {
                return $base !== null && $base !== '' && Carbon::parse($server)->equalTo(Carbon::parse($base));
            } catch (\Throwable) {
                return false;
            }
        }

        return (string) $server === (string) $base;
    }
}
