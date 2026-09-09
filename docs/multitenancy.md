# Multiempresa (multi-tenancy)

## Modelo actual: **un deploy por cliente**

Cada cliente / vertical se vende como una **copia desplegada por separado** (su
propio dominio, su propia base de datos). En la práctica el sistema corre
**single-tenant**: hay **una sola fila en `companies`** por instalación.

El esquema *está preparado* para multiempresa (columna `company_id` en casi toda
tabla operativa, `User belongsTo Company`), pero **no hay aislamiento estructural**:
no hay global scope, ni trait `BelongsToCompany`, ni middleware de tenant, ni
conexión por tenant.

### Cómo se resuelve el tenant hoy

`App\Http\Controllers\Api\Concerns\ResolvesCompany::companyId()`:

1. Request autenticado → **siempre** `$request->user()->company_id`.
2. Request sin usuario (catálogo público, formulario de leads) o usuario sin
   `company_id` → la **única** empresa que existe (`Company::orderBy('id')->value('id')`).
3. Sin ninguna empresa configurada → **500** (instalación rota, falta el seeder;
   500 y no 503 a propósito: es permanente, no invita a reintentar). Antes: el
   peligroso `?? 1` que inventaba un id inexistente.

Cada controller que lista/escribe datos de tenant aplica **manualmente**
`->where('company_id', $this->companyId($request))`. `BaseCrudController` lo hace
en `index/show/update/destroy` y fuerza `company_id` en `store`. Los controllers
especializados (`QuoteController`, `OrderController`, `PurchaseOrderController`,
`StockTransferController`, `ClientController::history`, `DashboardController`,
`ReportController`, `ExportController`, `ContingencyController`) lo repiten.

### Por qué es aceptable hoy

Con **una sola empresa por deploy no existe acceso cross-tenant**: no hay una
segunda empresa cuyos datos leer. El riesgo real que sí se cerró:

- `UserController` aceptaba `company_id`/`status` por payload (mass-assignment) →
  arreglado con `StoreUserRequest`/`UpdateUserRequest` (`UserManagementTest`).
- `ResolvesCompany` inventaba `company_id = 1` con la tabla vacía → ahora 500
  (`TenancyResolutionTest`).
- `AuditService` guardaba el hash de `password` en `audit_logs` → ahora filtra los
  atributos `$hidden` del modelo.

## Qué cambiar si se pasa a SaaS multiempresa (misma base, varios tenants)

**No hacerlo salvo que el modelo de negocio lo pida.** Es un rediseño, no un
parche. Superficie de migración:

### 1. Aislamiento automático de queries

- Agregar un trait `BelongsToCompany` con un **global scope** que filtre por el
  tenant activo en TODO modelo con `company_id`. Reemplaza los ~40
  `->where('company_id', …)` manuales y elimina la clase de bug "ruta anidada
  nueva sin el `abort_unless`".
- Resolver el tenant activo una sola vez por request (middleware) y guardarlo en
  un contenedor/`context`, no re-resolverlo en cada controller.

### 2. Resolución del tenant

- **Autenticado**: `user->company_id` sigue sirviendo, pero convertir el "usuario
  sin `company_id`" en **error duro** (hoy cae a la única empresa).
- **Público** (catálogo, leads): resolver la empresa por **host/subdominio o slug**
  en la URL, nunca "la primera". Hoy `PublicCatalogController` y
  `StorePublicQuoteRequest` asumen empresa única.

### 3. Roles y permisos

- Spatie corre con `teams => false` (`config/permission.php`): **los roles son
  globales**. Cualquiera con `roles.manage` ve/edita/re-permisiona los roles de
  todas las empresas, y puede auto-asignarse `users.manage`/`settings.manage`.
- Para multiempresa: habilitar **Spatie Teams** (`team_foreign_key = company_id`)
  o agregar `company_id` a `roles`. Migración de datos de los roles existentes.

### 4. `UserController`

- Ya no acepta `company_id` por payload (bien). Para multiempresa además: al crear
  un usuario, `company_id` = tenant activo del admin; validar que el `role`
  asignado pertenece a ese tenant.

### 5. Recursos globales que NO llevan `company_id` (y está bien)

`users` (email único **global**), `roles`/`permissions` + pivots Spatie,
`personal_access_tokens`, `cache*`, `jobs*`, `sessions`, `password_reset_tokens`.
`users.email` global hay que revisarlo: en SaaS quizás el mismo email en dos
empresas.

### 6. Otros puntos

- `products/{companyId}/…` (path de imágenes) ya está aislado por empresa — sirve.
- `AuditLog` filtra por `company_id` en `BaseCrudController::index` — un `user_id`
  cruzado de otro tenant simplemente no devuelve nada. Con global scope, gratis.
- `contingency_*` keyean por `company_id` — revisar `HandlesContingencySync`.
- Rate limiters (`catalog-read`, `catalog-quote`) son por IP — en multiempresa
  quizás por (tenant, IP).

## Checklist de decisión

- ¿El cliente pide "una cuenta, varias sucursales/empresas"? → SaaS multiempresa,
  hacer 1–6.
- ¿Sigue siendo "un negocio = un deploy"? → **no tocar**. El modelo actual es más
  simple y el aislamiento por deploy es total.
