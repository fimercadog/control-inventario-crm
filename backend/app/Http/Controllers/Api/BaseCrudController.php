<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\HandlesContingencySync;
use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

abstract class BaseCrudController extends Controller
{
    use HandlesContingencySync;
    use ResolvesCompany;

    protected string $model;

    protected string $resource;

    protected array $with = [];

    protected array $withCount = [];

    protected array $searchable = [];

    protected array $filterable = [];

    /**
     * Payload validado. Si existe App\Http\Requests\Store{Modelo}Request se
     * aplican sus reglas (mismo FormRequest para crear y actualizar; en update
     * las reglas pasan a "sometimes" porque el toggle de estado manda payload
     * parcial). Sin FormRequest, se conserva el comportamiento previo.
     */
    protected function validatedInput(Request $request, bool $isUpdate = false): array
    {
        $class = 'App\\Http\\Requests\\Store'.class_basename($this->model).'Request';

        if (! class_exists($class)) {
            return $request->all();
        }

        if (! $isUpdate) {
            return app($class)->validated();
        }

        $form = new $class;
        $rules = collect($form->rules())
            ->map(fn ($rule) => array_values(array_unique(['sometimes', ...(array) $rule])))
            ->all();

        return validator($request->all(), $rules, $form->messages(), $form->attributes())->validate();
    }

    public function index(Request $request, TableQueryService $tables)
    {
        $query = ($this->model)::query()
            ->where('company_id', $this->companyId($request))
            ->with($this->with)
            ->withCount($this->withCount);

        $tables->apply($request, $query, $this->searchable, $this->filterable);

        return ($this->resource)::collection($query->paginate(min((int) $request->input('per_page', 10), 100)));
    }

    public function store(Request $request, AuditService $audit)
    {
        $payload = $this->validatedInput($request);
        $payload['company_id'] ??= $this->companyId($request);

        if ($existing = $this->contingencyFirstOrCreate($request, $payload)) {
            $model = $existing->load($this->with);
            if ($model->wasRecentlyCreated) {
                $audit->record('created', $model, $request);
            }

            return (new $this->resource($model))->response()->setStatusCode(201);
        }

        $model = ($this->model)::create($payload)->load($this->with);
        $audit->record('created', $model, $request);

        return (new $this->resource($model))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $id)
    {
        $model = ($this->model)::query()
            ->where('company_id', $this->companyId($request))
            ->with($this->with)
            ->findOrFail($id);

        return new $this->resource($model);
    }

    public function update(Request $request, string $id, AuditService $audit)
    {
        $model = ($this->model)::query()->where('company_id', $this->companyId($request))->findOrFail($id);

        if ($conflict = $this->contingencyConflict($request, $model)) {
            return response()->json([
                'conflict' => true,
                'message' => 'El registro cambio en el servidor mientras estabas en contingencia.',
                'fields' => $conflict,
                'server' => new $this->resource($model->load($this->with)),
            ], 409);
        }

        $oldValues = $model->getOriginal();
        $model->update($this->validatedInput($request, isUpdate: true));
        $model->load($this->with);
        $audit->record('updated', $model, $request, $oldValues);

        return new $this->resource($model);
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        $model = ($this->model)::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        $original = $model->getOriginal();

        try {
            $model->delete();
        } catch (QueryException $e) {
            // FK RESTRICT: el registro esta referenciado por historia (pedidos,
            // movimientos, cotizaciones...). No se borra -> tampoco se audita.
            if ($this->isForeignKeyViolation($e)) {
                return response()->json([
                    'message' => 'No se puede eliminar: hay registros historicos que dependen de este. Marcalo como inactivo.',
                ], 422);
            }
            throw $e;
        }

        $audit->record('deleted', $model, $request, $original);

        return response()->noContent();
    }

    /**
     * ¿La excepcion es una violacion de clave foranea (borrar un padre referenciado)?
     * Portable entre SQLite (23000/"FOREIGN KEY constraint failed"), MySQL/MariaDB
     * (1451/1452) y PostgreSQL (23503). El SQLSTATE 23000 a secas no sirve: tambien
     * lo emiten UNIQUE y NOT NULL.
     */
    private function isForeignKeyViolation(QueryException $e): bool
    {
        $driverCode = (int) ($e->errorInfo[1] ?? 0);

        return in_array($driverCode, [1451, 1452], true)
            || (string) ($e->errorInfo[0] ?? '') === '23503'
            || str_contains(strtolower($e->getMessage()), 'foreign key');
    }
}
