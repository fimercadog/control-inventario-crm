# Estrategia de borrado / archivado

Regla base: **no se agrega `SoftDeletes` a todas las tablas.** Cada entidad cae
en uno de cuatro niveles según su valor histórico y sus referencias.

## Los cuatro niveles

### 1. Borrado duro (hard delete) — entidades operativas sin valor histórico

Se pueden borrar de verdad. Si hay una FK que lo impide, el sistema responde
**422 "marcá como inactivo"** (`BaseCrudController::destroy` detecta la violación
de FK de forma portable — SQLite / MySQL / Postgres).

Entidades: `Contact`, `ClientNote`, `Segment`, `Activity`, `Category`, `Brand`,
`Unit`, `Warehouse` (cuando no tienen hijos).

Estado hoy: **implementado**. No hay nada que cambiar.

### 2. No se borra — se archiva con `status`

Entidades "maestras" a las que apuntan documentos históricos. Borrarlas rompería
pedidos, cotizaciones o movimientos pasados. En vez de borrar, se pone
`status = inactive`: desaparecen de los selectores pero los históricos siguen
resolviendo.

Entidades: `Client`, `Product`, `Supplier`.

Refuerzo en BD: las FK de las tablas históricas hacia estas son **`RESTRICT`**
(migración `2026_09_06_000009_harden_referential_integrity`). Los ítems de línea
guardan snapshot (`product_name`, `sku`) para sobrevivir incluso a un cambio de
nombre.

Estado hoy: **implementado**.

### 3. Inmutable — nunca se borra ni se edita

Registros que son la fuente de verdad contable/legal. No tienen ruta `destroy`;
las FK entrantes son `RESTRICT`.

Entidades: `StockMovement` (ledger append-only), `AuditLog`, documentos en estado
final (`Order` confirmado → generó movimientos de stock; `Quote` aceptada;
`PurchaseOrder` recibida).

Estado hoy: **implementado** (por ausencia de endpoint + RESTRICT).

### 4. Soft-delete — dato sensible que se "elimina" desde la UI pero debe conservarse

Para módulos donde el usuario necesita poder eliminar un registro (se equivocó,
lo duplicó) **pero el dato es médico / legal / auditable** y no puede
desaparecer físicamente. El borrado es reversible; la fila queda con
`deleted_at`, fuera de las consultas normales pero recuperable y visible en
auditoría.

Entidades del core actual: **ninguna.** Un CRM+Inventario no tiene dato de este
tipo (una nota de cliente no es una historia clínica).

**Entidades futuras (vertical veterinaria) que SÍ van en este nivel:**
Historia clínica / Consultas, Vacunas y Desparasitaciones aplicadas,
Prescripciones, Procedimientos / Cirugías, Diagnósticos, Resultados de
laboratorio, Evoluciones de hospitalización.

## Patrón para el nivel 4 (cuando se implemente)

Laravel ya trae todo — no hace falta una abstracción propia:

```php
// Migración
Schema::create('consultations', function (Blueprint $table) {
    // ...
    $table->softDeletes();               // agrega deleted_at nullable
});

// Modelo
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultation extends Model
{
    use SoftDeletes;
}
```

Reglas de implementación para esos módulos:

- El `destroy` del controller hace soft delete (comportamiento por defecto de
  Eloquent con el trait).
- `AuditService::record('deleted', …)` se sigue llamando — el borrado queda
  auditado con quién y cuándo.
- **No** exponer `forceDelete` por API. Un borrado físico, si alguna vez hace
  falta, es tarea de mantenimiento con acceso a BD.
- Considerar una vista de "papelera" (registros con `deleted_at`) con acción de
  restaurar, gated por un permiso administrativo.
- Las FK entrantes a un modelo soft-deletable siguen las reglas de los niveles
  1–3 según corresponda (una prescripción soft-borrada no debería romper la
  historia clínica que la contiene → esa relación va con snapshot o
  `RESTRICT`, no `CASCADE`).

## Qué NO hacer

- No agregar `SoftDeletes` a `Client`, `Product`, `User`, `Company`, catálogos, ni
  al ledger. Ya tienen su mecanismo (niveles 2 y 3) y sumar `deleted_at` encima
  solo agrega una segunda forma de "no existe" que confunde las queries.
- No hacer soft-delete global "por las dudas". Es una decisión por entidad,
  justificada por el nivel 4.
