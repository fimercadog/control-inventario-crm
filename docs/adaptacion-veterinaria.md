# Adaptación → Plataforma para veterinarias

> **Estado: análisis (Fase 0–2). Dry-run — no se modificó código.**
> Base: `control_inventario+crm` @ `master` `012be7d`. Generado por
> `project-reuse-orchestrator`.

---

## Mapa del proyecto base

### Stack

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12, PHP ^8.4, SQLite dev / MySQL-MariaDB prod. Sanctum SPA (cookie de sesión, sin bearer). `spatie/laravel-permission`. `barryvdh/laravel-dompdf` (solo exports). Sin media library, sin activitylog, sin paquete de multitenancy. |
| Frontend | Next.js 16 (App Router, modificado — ver `frontend/AGENTS.md`), React 19, Tailwind v4 (tokens CSS, sin config), primitivos shadcn hand-rolled sobre Radix (solo 5), TanStack Table, Recharts, axios, `sonner`. `react-hook-form`+`zod` instalados pero **sin usar** (forms nativos con `FormData`). |
| Auth | Sanctum SPA stateful. Frontend + API **deben ser subdominios del mismo dominio raíz** (`SESSION_DOMAIN=.raiz`, cookie same-site lax, HTTPS). Restricción de infra dura. |
| Deploy | Backend en Hostinger (SSH + LiteSpeed, PHP 8.4 explícito), frontend en Vercel. `NEXT_PUBLIC_*` horneadas en build. `route:cache` obligatorio tras deploy. |

### Arquitectura

- **Motor de CRUD reutilizable** — es el activo principal:
  - Backend: `BaseCrudController` (index/store/show/update/destroy genérico, dirigido por `$model/$searchable/$filterable/$with`) + `ApiFormRequest`/`Store*Request` + `TableQueryService` (search/filter/date-range/sort) + `JsonResource`.
  - Frontend: `ModuleTablePage<T>` + `CrudModal` (`CrudField` descriptors) + `useApiTable` + `DataTable` (TanStack). La mayoría de páginas `/app/*` son configs de ~20 líneas.
  - **Un módulo nuevo = migración + modelo + controller que extiende Base + Store*Request + Resource + ruta + permiso + un `ModuleTablePage`.**
- Lógica de dominio: **controllers gordos** + capa de servicios mínima (`AuditService`, `TableQueryService`). Flujos multi-paso (quote→order, order confirm→stock out, PO receive→stock in, transfer→2 movimientos, quote público→Client+Quote+Lead) inline en el controller, con `DB::transaction` donde hay escritura multi-fila.
- **Sin policies, sin gates.** Autorización = middleware `can:<permiso>` en cada ruta.
- **Sin jobs/events/listeners/commands/mails** (salvo el reset de password de Laravel). Todo síncrono, incluido export PDF/CSV.
- **Sin soft-deletes.** Borrado duro + FK `RESTRICT` en tablas históricas + respuesta 422 "marcá como inactivo". El estado `active/inactive` es el mecanismo de archivado.
- **Multiempresa**: columna `company_id` en casi toda tabla operativa + `where('company_id', …)` **manual** en cada controller (sin global scope, sin trait, sin middleware). `ResolvesCompany::companyId()` = `user->company_id ?? Company::first()->id ?? 1`. En la práctica corre **single-tenant** (una empresa por deploy).

### Modelo de datos (27 migraciones, ~40 tablas)

```
companies ─1:N─ users (company_id, nullOnDelete; owner_id en deals/orders)

companies ─1:N─ clients ─1:N─ deals ─1:N─ activities
                   │            │    └─1:N─ orders (deal_id nullOnDelete)
                   │            └─1:N─ quotes
                   ├─1:N─ contacts / client_notes
                   ├─1:N─ orders / quotes
                   └─ segment_id → segments

companies ─1:N─ products ─ category_id/brand_id/unit_id (nullOnDelete)
                   ├─1:N─ stock_movements ─ warehouse_id → warehouses
                   ├─1:N─ stock_transfers ─ from/to_warehouse_id
                   └─1:N─ order_items / quote_items / purchase_order_items  (+ snapshot product_name/sku)

companies ─1:N─ suppliers ─1:N─ purchase_orders ─1:N─ purchase_order_items
orders ─1:N─ order_items ;  quotes ─1:N─ quote_items ;  quote.converted_order_id → orders
audit_logs (morph flojo: entity = string FQCN, sin FK)
contingency_sessions ─1:N─ contingency_events
```

- Stock = `SUM(stock_movements.quantity)` — **no hay tabla de stock**.
- Integridad reforzada en `2026_09_06_000009_harden_referential_integrity`: 12 FK `CASCADE→RESTRICT` en históricos, `activities.deal_id CASCADE→SET NULL`, columnas snapshot `product_name`/`sku` en items, ~18 índices FK que faltaban.
- Idempotencia offline: `products.client_uuid` y `deals.client_uuid` (uuid nullable unique).
- Portabilidad SQLite↔MySQL cuidada: sin ENUM raw, sin generated columns, sin fulltext; enums modelados como `string` + validación en FormRequest. JSON solo en `audit_logs`, `contingency_*` (sin queries JSON-path).

### Transversal

- **Auth**: `AuthController` (login/logout/me/forgot/reset), session regen, throttle 6/min login (sin lockout por cuenta), errores genéricos (sin enumeración), `bootstrap/app.php` scrub de stack traces en `api/*` incluso con `APP_DEBUG=true`, `SecurityHeaders` middleware.
- **RBAC**: 17 permisos, 5 roles seedeados (`Super Admin`, `Administrador de empresa`, `Ventas`, `Inventario`, `Usuario`). Roles **globales** (Spatie `teams=false`). Frontend refleja los permisos en el nav (`hasAnyPermission`, OR-semantics) — cosmético, la API igual devuelve 403.
- **Contingencia (offline)** — infra de alto valor: `ContingencySession`/`ContingencyEvent` + `HandlesContingencySync` (merge 3 vías base/servidor/offline, `client_uuid` idempotencia, cola en IndexedDB, resolución de conflictos campo a campo) + `ContingencyModuleRegistry` (hoy solo `products`, `deals`). Skill `contingency-mode` documenta la arquitectura.
- **Superficie pública** (CSRF-exenta, `api/public/*`): `POST /public/leads` (5/min), catálogo `GET /public/catalog/{products,products/{id},categories}` (120/min), `POST /public/catalog/quote-requests` (5/min) → crea Client(inactive)+Quote(draft, source=catalog)+Lead. Solo throttle por IP, **sin CAPTCHA/honeypot**.
- **Exports**: `GET /exports/{resource}.{csv|pdf}` para 8 recursos, permiso por recurso.
- **Deploy**: runbook completo en `docs/hostinger-deployment.md`. Rollback de migraciones: **no definido** (pendiente).

### Baseline (antes de adaptar)

| Check | Resultado |
|---|---|
| `php artisan test` (backend, ~101 tests) | ✅ PASS |
| `tsc --noEmit` (frontend) | ✅ PASS |
| `npm run lint` (frontend) | ✅ PASS |
| `npm run build` (frontend, prod) | ✅ PASS |
| `pint` (formato backend) | ❌ FAIL — ~35 archivos **preexistentes**, solo fixers de formato (orden de imports, imports sin usar, comillas). No bloqueante. Deuda de estilo previa. |

**Veredicto: funcionalmente verde.** El proyecto funcionaba antes de tocarlo.
⚠️ Rama actual = `master` (base). Árbol de trabajo sucio (18 archivos sin commitear del "plan base" + Leads/Catálogo). Para la adaptación real: **rama/repo nuevo primero**.

### Testing

- Backend: PHPUnit, ~101 tests, **todos Feature/HTTP** (≈0 unit). Cubren: seguridad de auth/sesión, matriz de permisos por endpoint, validación CRUD + no-leak de debug, integridad referencial, puente CRM↔inventario, transfers, catálogos, aislamiento de imágenes por empresa, ciclo de quotes, contactos/notas, historia de cliente, leads (form público), catálogo público (14), reportes comerciales, dashboard, contingencia (9, merge 3 vías). Release gate corre también contra **MariaDB**.
- Frontend: **sin test runner**. Solo `lint` + `tsc` (vía `next build`).
- E2E: `e2e/` en **Python** Playwright, **un solo escenario** (catálogo anónimo → carrito → quote → verificar en CRM). Sin CI — gates manuales.

### Documentación (`docs/`)

Autoritativos: `roadmap-modulos.md` (backlog + orden de ejecución), `avance-2026-09-06.md` (última sesión), `hostinger-deployment.md` (runbook), `roles-permissions.md`, `hallazgos-auditoria-externa.md`, `plan-base.md`, `referencia-visual.md`, `release-2026-09-07-catalogo-publico.md`.
Desactualizados: `modules.md` (superado por roadmap), `database.md` (lista ~15 tablas de ~40), `api.md` (falta el slice CRM), `color-palette.md` (**proyecto viejo — magenta, no el verde actual**).

### Reutilizable de fábrica (núcleo para cualquier vertical)

Auth stack · Sanctum SPA setup · scrub de excepciones · `SecurityHeaders` · rate limiters ·
`Company` + convención `company_id` + `ResolvesCompany` + `CompanyController` ·
RBAC (wiring Spatie, `RoleController`, `UserController`, seeder de roles/permisos, convención `can:`) ·
Audit (`AuditLog`, `AuditService`, `AuditLogController`) ·
**Motor CRUD**: `BaseCrudController` + `TableQueryService` + `ApiFormRequest` + `JsonResource` ↔ `ModuleTablePage` + `CrudModal` + `useApiTable` + `DataTable` ·
`src/components/ui/*` + `theme-provider` + tokens de `globals.css` (re-skin) ·
`AdminShell` (shell/guard/plan-gating — `navGroups` es dato de dominio) · `plan.ts` (mecanismo) ·
**Framework de contingencia completo** (solo `adapters.ts`/registry son dominio) ·
`ExportController` (CSV/PDF dirigido por mapa) ·
subida de archivos (`ProductController::image` + `Rules\ImageFile` + path aislado por empresa) ·
captura de Leads + form público con throttle nombrado ·
mecanismo catálogo público (anónimo → carrito → quote-request → CRM; `useSyncExternalStore`) ·
shell de marketing (`MarketingLayout`, `PageHero`, `Section`, `Reveal`, `ProductPage`, `LegalPage`, `ContactForm`/`LeadFields`) + infra SEO (`robots`, `sitemap`, og-image, favicons) ·
páginas de auth (`login`/`forgot`/`reset` + `AuthSplitLayout`) ·
patrón de migración de integridad referencial (RESTRICT en históricos, snapshots name/sku) ·
componentes de gráfico (Recharts frames — las métricas son dominio) ·
plumbing de deploy (Hostinger + Vercel, mismo dominio raíz).

---

## Decisión de adaptación → veterinaria

> **Revisada con las correcciones de Fidel (2026-09-09).** Cambios clave respecto
> del primer borrador de la skill:
> - `Client` **NO se renombra** → queda como entidad core. La veterinaria le pone
>   la etiqueta "Propietario" en la UI y agrega un `Patient` relacionado.
> - `Product`/`Category`/`Brand`/`Unit` **NO se renombran** → core de inventario.
>   La vet agrega un clasificador `kind` + campos. El producto físico del
>   inventario es una cosa; el acto clínico de vacunación es otra (va en Historia
>   clínica).
> - `Deal` + pipeline + reportes-comerciales **NO se borran** → se **ocultan** vía
>   plan gate (una veterinaria grande sí los usa: convenios, criaderos, planes de
>   bienestar, cuentas corporativas).

**Principio rector: "keep the core generic".** Una vertical *agrega* entidades y
roles sobre las entidades del core; no las renombra. `Client` es `Client` en la
vet, en la inmobiliaria y en el car wash. Renombrar una entidad core forkea el
core de esa vertical y lo separa del proyecto madre y de todas las demás.

### 1. CONSERVAR (sin cambios o con relabel + extend — sin renombrar tabla)

| Elemento | Motivo |
|---|---|
| Auth completo (`AuthController`, Sanctum SPA, reset, session regen, throttle, scrub de errores) | Infra. Verbatim. Ya tiene tests de regresión (AUD-10). |
| `Users` + `UserController` | Infra. ⚠️ Requiere `StoreUserRequest` antes de multi-tenant (ver riesgos). |
| Roles & permisos (Spatie, `RoleController`, `/permissions`, seeder, convención `can:`) | Infra. Se agregan permisos vet al catálogo, no se cambia el mecanismo. |
| `AuditLog` + `AuditService` + `AuditLogController` | Infra. Morph flojo por diseño. |
| `Company` + `CompanyController` + `/app/configuracion` | Infra. Single-tenant por deploy. |
| **`Client` + `ClientController` (+ `history`) + `Contact` + `ClientNote` + `Segment`** | **Core de CRM — NO renombrar.** La vet muestra "Propietario" en la UI y agrega `Patient` (belongs to `Client`; join `patient_owner` si hay multi-propietario). `history` se extiende para incluir citas + historia clínica. `unique(company_id,email)` sirve. |
| **`Product` + `Category` + `Brand` + `Unit` + `Warehouse` + `StockMovement` + `Supplier` + `PurchaseOrder` + `Order`** | **Core de Inventario — NO renombrar.** La vet agrega `Product.kind` (medicamento/vacuna/alimento/insumo/accesorio/otro) + campos (lote, vencimiento, principio activo, presentación). Stock, movimientos, compras y ventas de mostrador se reusan tal cual. |
| `Quote` / `QuoteItem` + `QuoteController` (send/respond/convert) | Core comercial. La vet lo usa como "Presupuesto de tratamiento" (label + copy); el flujo no cambia. |
| `Activity` + Tareas/Seguimientos/Calendario (vistas sobre `Activity`) | Core. Sirven como tareas clínicas / recordatorios. El **Calendario** pasa a ser una vista del nuevo módulo Citas (ver AGREGAR), no el modelo de agenda. |
| Motor CRUD backend (`BaseCrudController`, `ApiFormRequest`, `TableQueryService`, Resources) | **El activo real.** Cada entidad vet nueva enchufa acá. |
| Motor CRUD frontend (`ModuleTablePage`, `CrudModal`, `useApiTable`, `DataTable`, `table-types`) | Ídem, lado cliente. |
| UI kit (`ui/*`), `theme-provider`, sistema de tokens `globals.css` | Se re-skinea paleta/logo, nada más. |
| `AdminShell` (mecanismo shell/guard/plan-gating) | `navGroups` y los strings de permiso son dato de dominio → se editan. |
| `plan.ts` (mecanismo `isBasePlan`/`planHidesRoute`) | Los sets `BASE_PLAN_HIDDEN` son dato de dominio → se redefinen. |
| **Framework de contingencia completo** (`lib/contingency/*`, `ContingencySession/Event`, `HandlesContingencySync`, banner, `/app/contingencia`) | Infra de alto valor. Solo `adapters.ts` + `ContingencyModuleRegistry` apuntan a módulos → se re-apunta a pacientes/citas/inventario. |
| `ExportController` + vista `exports.table` | Infra. Se agrega el mapa recurso→permiso de los módulos vet. |
| Subida de archivos (`ProductController::image` + `Rules\ImageFile` + path por empresa) | Patrón reutilizable para foto de mascota, adjuntos de lab, documentos clínicos. |
| Captura de Leads + form público con throttle (`Lead`, `LeadController::store`, `StoreLeadRequest` con consentimiento) | Se reusa como "solicitud de cita / consulta nueva". |
| Mecanismo catálogo público (anónimo → carrito → quote-request → CRM, rate limiters nombrados, `catalog-cart`) | Patrón transferible a "reservá tu turno online". |
| Shell de marketing (`MarketingLayout`, `PageHero`, `Section`, `Reveal`, `ProductPage`, `LegalPage`) + infra SEO | Estructura genérica; el copy es dominio. |
| Páginas de auth (`login`/`forgot`/`reset`, `AuthSplitLayout`) | Verbatim (salvo `demoUsers`). |
| Patrón de migración de integridad referencial | Se aplica igual a las tablas vet. |
| Componentes de gráfico (Recharts frames del dashboard) | Las métricas cambian, los componentes no. |
| Plumbing de deploy (Hostinger + Vercel, `.env` templates, `route:cache`) | Mismo pipeline. |

### 2. MODIFICAR — relabel + extend (sin renombrar tabla salvo indicación)

| Elemento | Cambio | Clasificación | Nota |
|---|---|---|---|
| `Client` (UI) | Etiqueta "Propietario / Tutor" en el nav y las páginas; agregar relación con `Patient` | relabel + relación nueva | La tabla y el modelo siguen siendo `Client`. |
| `Product` | Agregar `kind` (medicamento/vacuna/alimento/insumo/accesorio/otro) + `lote`, `fecha_vencimiento`, `principio_activo`, `presentacion` (nullable) | extend (columnas) | Sigue siendo `Product`. La **vacuna como producto** vive en inventario; la **aplicación de vacuna** es un acto clínico aparte (AGREGAR §Vacunas). |
| `Unit` | Contenido vet (ml, dosis, ampolla, caja) | solo datos | |
| `Quote` / `QuoteItem` | Label "Presupuesto de tratamiento" + copy | relabel | Flujo send/respond/convert intacto. |
| `Order` / `OrderItem` | Label "Venta / factura de mostrador"; puede incluir líneas de servicio (consulta) además de productos | relabel + posible línea de servicio | confirm→stock out intacto. |
| `DashboardController` + `use-dashboard` | Métricas: citas hoy, pacientes activos, vacunas por vencer, stock bajo de medicamentos, ingresos por servicio | rehacer métricas | Componentes de gráfico intactos. |
| `ReportController` / `reportes` | Reportes clínicos | rehacer métricas | (comercial → ocultar, ver §3) |
| `lib/types.ts` | Tipos de las entidades nuevas + campos vet en las existentes | extend + agregar | No se borran los tipos core. |
| `admin-shell.tsx` `navGroups` + `PREMIUM_INFO` + `roles/[id]` `PERMISSION_LABEL` | Nav vet, grupos nuevos (Clínica), copy | dato de dominio | |
| `plan.ts` `BASE_PLAN_HIDDEN` | Redefinir para los planes de la vet (ver §3) | dato de dominio | Mecanismo intacto. |
| Catálogo público | Presentar como **"Reservá tu cita / turno online"** (label + flujo hacia el nuevo módulo Citas) | relabel + rewire | Mismo patrón anónimo→CRM. |
| Copy de marketing (todas las páginas, `marketing-data.tsx`) | "Software para veterinarias" | reescribir contenido | Shell intacto. |
| `login-form` `demoUsers` | Usuarios demo de la vet | dato | |
| Branding (`logo.tsx`, `icon`/`apple-icon`/`og`, wordmark, paleta, `color-palette.md`) | Identidad vet | re-skin | |
| Colombia-specific (COP, Ley 1581, `America/Bogota`, WhatsApp) | Según mercado destino | revisar | Probablemente se conserva. |

### 3. OCULTAR (plan gate — el código queda, no se borra)

| Elemento | Motivo | Cómo |
|---|---|---|
| `Deal` + pipeline por etapas + `/app/deals` | Una clínica chica no tiene ciclo comercial por etapas — **pero una veterinaria grande sí** (convenios empresariales, criaderos, fundaciones, planes de bienestar, cuentas corporativas). | Agregar sus rutas a `BASE_PLAN_HIDDEN` en `plan.ts`. El modelo, el controller y el acoplamiento (`activities.deal_id`, `orders.deal_id`, `quotes.deal_id` — todos ya `nullable`/`SET NULL`) quedan intactos. |
| `reportes-comerciales` (funnel/win-rate/by-owner) | Depende de `Deal`. | Ocultar junto con Deal. |
| `StockTransfer` / `/app/transferencias` | Innecesario con una sola sede. | Ocultar vía plan (sirve si la clínica abre sucursales). |
| Catálogo público **como tienda con precios** + `is_public` en productos + `PublicProductResource` | Si la vet no vende productos online. | Ocultar la tienda; conservar el mecanismo público para "reservar cita". |
| `/app/ia` (asistente IA) | Placeholder sin proveedor. | Ya está como botón Premium bloqueado — se mantiene. |
| Páginas de marketing de módulos ocultos (`/producto/compras`, etc.) | Coherencia con el plan mostrado. | Quitar del nav de marketing; la ruta puede quedar. |

**ELIMINAR de verdad: nada en esta primera versión.** Todo lo que no aplica hoy podría aplicar a una clínica más grande — se oculta.

### 4. AGREGAR (módulos nuevos — nada de esto existe)

En orden de dependencia:

1. **Especies / Razas** — catálogos simples (patrón `categories`/`brands`, `company_id`-scoped). Dependencia de Pacientes.
2. **Pacientes / Mascotas** — `client_id` (**belongs to `Client`** — el propietario es un Client con rol; si hace falta multi-propietario, join `patient_owner (patient_id, client_id, rol)`), `species_id`, `breed_id`, nombre, sexo, fecha nac., peso, microchip, esterilizado, foto. Entidad central del vertical. Considerar `SoftDeletes` (dato clínico).
3. **Historia clínica / Consultas** — SOAP (subjetivo/objetivo/análisis/plan), `patient_id`, `vet_id` (User), fecha, motivo, peso, temperatura. Scaffolding: patrón `ClientNote` + `Activity`. `SoftDeletes`.
4. **Citas / Agenda** — modelo real: `patient_id`, `client_id`, `practitioner_id` (User), inicio/fin, duración, box/recurso, estado (programada/confirmada/atendida/no-asistió/cancelada), motivo. El **Calendario** existente pasa a ser una vista de este modelo. El form público "Reservá tu cita" escribe acá.
5. **Vacunas** + **Desparasitaciones** — **acto clínico**, distinto del producto en inventario: `patient_id`, `product_id` (la vacuna del inventario, opcional), fecha aplicada, lote, `vet_id`, próxima dosis + alerta por fecha. Aplicar la vacuna descuenta stock (movimiento `out`, patrón order-confirm). Alerta = template `StockAlertController` sobre fecha.
6. **Prescripciones / Recetas** — `consultation_id`, líneas de medicamento (dosis/frecuencia/duración), imprimible (dompdf ya está).
7. **Procedimientos / Cirugías** — tipo, `patient_id`, fecha, `vet_id`, notas, consentimiento (adjunto).
8. **Diagnósticos** (catálogo opcional) y **Tratamientos**.
9. **Resultados de laboratorio** — adjuntos por `patient_id` (patrón file upload por empresa).
10. **Hospitalización / Internación** — `patient_id`, ingreso, egreso, box, evoluciones.
11. **Documentos clínicos** — adjuntos por paciente.
12. **Reportes clínicos** — pacientes atendidos, vacunas aplicadas, ocupación de agenda, ingresos por servicio.

Permisos nuevos: `patients.manage`, `appointments.manage`, `medical_records.manage`, `vaccinations.manage`, `prescriptions.manage`, `procedures.manage`, `clinical_reports.view`.

Nota transversal: los módulos clínicos deberían llevar `SoftDeletes` (dato médico/legal). El core actual no lo usa — decidir si se agrega el trait solo a las tablas clínicas o al patrón general (ver Riesgo #8).

---

## Mapa definitivo (Fidel)

```
FIDEL CORE
├── Infra:  Autenticación · Empresas · Usuarios · Roles/permisos · Auditoría
│           Configuración · CRUD engine · UI kit · Archivos · Exportaciones
│           Contingencia · Plan gating · Shell de marketing + SEO · Deploy
│
├── CRM CORE (entidades genéricas — NO se renombran)
│   └── Leads · Clientes · Contactos · Notas · Segmentos · Cotizaciones
│       Actividades · Deals   (Deals se OCULTA en el plan vet base)
│
└── INVENTARIO CORE (entidades genéricas — NO se renombran)
    └── Productos · Categorías · Marcas · Unidades · Bodegas · Movimientos
        Proveedores · Compras · Ventas de mostrador

          ↓ reutiliza sin tocar

VERTICAL VETERINARIA  (todo esto se AGREGA encima)
├── Especies · Razas
├── Pacientes/Mascotas        → belongs to Client
├── Citas / Agenda            → el Calendario core pasa a ser una vista
├── Historia clínica / Consultas (SOAP)
├── Vacunas · Desparasitación (acto clínico, ≠ producto de inventario)
├── Prescripciones · Procedimientos · Diagnósticos · Tratamientos
├── Laboratorio · Hospitalización · Documentos clínicos
└── Reportes clínicos
```

| Categoría | Qué |
|---|---|
| **CORE** (estable para todas las verticales) | auth · users · roles/permisos · audit · company/settings · motor `BaseCrudController`+`ModuleTablePage` · framework de contingencia · exports · file upload · plan gating · UI kit + tokens · shell de marketing + SEO · deploy · patrones de integridad referencial · mecanismo form-público→CRM · **`Client` y su familia** (contacts/notes/segments) · **`Product` y su familia** (category/brand/unit/stock/movements/suppliers/purchases) · `Quote` · `Order` · `Activity` · `Deal` |
| **ESPECÍFICO VET** (se agrega encima) | especies · razas · pacientes · citas/agenda · historia clínica · consultas SOAP · vacunas (acto clínico) · desparasitación · prescripciones · procedimientos · diagnósticos · tratamientos · laboratorio · hospitalización · documentos clínicos · reportes clínicos · los campos vet en `Product` · la relación `Patient`↔`Client` · el label "Propietario" |
| **Diferencia con el borrador v1 de la skill** | v1 proponía renombrar `Client→Propietario` y `Product→Medicamento` y **borrar** `Deal`. Corregido: relabel + extend, y `Deal` se **oculta**. La skill (`references/vertical-mapping.md`) ya quedó actualizada con este principio. |

---

## Riesgos detectados

| # | Riesgo | Impacto para la vertical vet |
|---|---|---|
| 1 | **Multitenancy manual sin global scope** — cada controller repite `where('company_id')`; cada ruta anidada nueva es un agujero cross-tenant potencial; fallback `Company::first()->id ?? 1`. | **Alto si la vet es SaaS multi-clínica.** Antes de escalar: `BelongsToCompany` global scope + resolver tenant por host/auth + borrar el fallback. Si es 1 clínica por deploy (como ahora), es aceptable. |
| 2 | `UserController` usa `$request->except([...])` → mass-assignment de `company_id`/`status`. No hay `StoreUserRequest`. | Medio. Un `users.manage` puede mover usuarios entre empresas. Arreglar antes de multi-tenant. |
| 3 | Roles **globales** (Spatie `teams=false`) — cualquiera con `roles.manage` se auto-asigna cualquier permiso; en multi-tenant edita roles de otras clínicas. | Medio-alto en multi-clínica. Habilitar Spatie teams o `company_id` en roles. |
| 4 | Endpoints públicos solo con throttle IP — sin CAPTCHA/honeypot. | Un form público "reservá tu cita" es escribible por bots (crea Owner/Appointment/Lead). Agregar honeypot + verificación de email. |
| 5 | `MAIL_MAILER=log` en la config prod documentada → el reset de contraseña **no llega**. | Ya está en el gate de venta de Fidel: configurar SMTP real. |
| 6 | CORS wildcard ngrok + `APP_DEBUG=true` + `NEXT_PUBLIC_DEMO_MODE=true` en los `.env.example`. | Limpiar para deploy real de cliente. |
| 7 | Frontend + API **en el mismo dominio raíz** (cookie Sanctum). | Restricción de infra dura — condiciona la elección de dominios de la vet. |
| 8 | **Sin soft-deletes** — borrado duro con RESTRICT. | Historia clínica, consultas, vacunas = dato médico/legal → **SÍ** se quieren soft-deletes o archivado. Decidir: trait solo en tablas clínicas nuevas, o adoptarlo como patrón general del core. Endurecer en la base. |
| 9 | Stock = `SUM(stock_movements)` sin tabla cache — subqueries correlacionadas. | Flagged para volumen; una clínica chica no lo nota. |
| 10 | Acoplamiento `Deal`↔`Activity` (`activity.deal_id`), `orders.deal_id`, `quotes.deal_id`. | **Ya no es problema**: `Deal` se oculta, no se borra. Los FK son `nullable`/`SET NULL`, así que ocultar el módulo del nav no rompe nada. |
| 11 | `docs/color-palette.md` desactualizado (proyecto viejo). | Cosmético — actualizar al re-skinear. |
| 12 | Estás en `master` con árbol sucio. | Para la adaptación real: rama/repo nuevo + commitear/stashear lo pendiente primero. |

---

## Recomendación de arquitectura

**Objetivo: que CRM+Inventario siga siendo el núcleo reutilizable sin frenar cada vertical.**

Para el volumen actual (5–10 clientes) y la forma de trabajar de Fidel (fork por copia):

1. **Ahora — endurecer el core en el proyecto base ANTES de forkear la vet.** Resolver en `control_inventario+crm` los riesgos que se arrastrarían a toda vertical:
   - `StoreUserRequest` (riesgo #2) — barato, alto valor.
   - Decidir soft-deletes: al menos dejar el patrón listo para los módulos nuevos (#8).
   - Si la visión es SaaS multi-clínica: `BelongsToCompany` global scope + Spatie teams (#1, #3). Si es 1-deploy-por-cliente, documentarlo como límite asumido y seguir.
2. **Marcar la frontera explícitamente** — este documento + un `docs/core-reutilizable.md` con la lista de archivos "core, no tocar salvo para mejorar el core" vs "vertical". El recon ya produjo esa lista (sección "Reutilizable de fábrica").
3. **Forkear la vet por copia** (rama/repo nuevo). Los módulos nuevos (pacientes, agenda, historia clínica) entran como **slices verticales sobre el motor existente** — el motor CRUD, auth, contingencia y UI kit **no se tocan**.
4. **Cuando haya 3+ verticales activas en producción** — recién ahí extraer el core a un paquete Composer + npm (o template repo) para que un fix de seguridad se propague. Antes de eso sería sobre-ingeniería: el core todavía tiene deudas que conviene cerrar primero.

**No recomendado ahora**: extraer el paquete compartido de entrada (ceremonia de versionado sin retorno con 1–2 verticales), ni reescribir la multitenancy si el modelo de venta es 1 deploy por clínica.

### Endurecimiento del core ANTES de forkear (en `control_inventario+crm`)

| # | Acción | Estado | Por qué antes del fork |
|---|---|---|---|
| 1 | `StoreUserRequest`/`UpdateUserRequest` + quitar el `$request->except([...])` de `UserController` | ✅ **hecho** (2026-09-09) — `UserManagementTest` (9) | Cerraba el mass-assignment de `company_id`/`status`. |
| 2 | `ResolvesCompany`: quitar el `?? 1` peligroso, 503 si no hay empresa | ✅ **hecho** — `TenancyResolutionTest` (2) | El `?? 1` inventaba un tenant inexistente con la tabla vacía. |
| 3 | Estrategia de soft-delete / archivado documentada | ✅ **hecho** — `docs/soft-delete-strategy.md` (4 niveles; el core no necesita código nuevo, los módulos clínicos usan nivel 4) | La vet lo necesita para dato clínico; el patrón queda listo. |
| 4 | `docs/core-reutilizable.md` — frontera core / vertical | ✅ **hecho** | Es lo que hace que el fork no degrade el core. |
| 5 | `docs/multitenancy.md` — superficie de migración a SaaS | ✅ **hecho** | Deja documentado qué cambiar si algún día es multi-clínica. |
| 6 | `pint` sobre los ~35 archivos con drift de formato | ✅ **hecho** — baseline 100% verde | Limpia el baseline antes de que la copia herede el ruido. |
| 7 | (Solo si la visión es SaaS multi-clínica) `BelongsToCompany` global scope + Spatie teams | ⏳ **no hecho — a propósito** | Modelo actual = 1 deploy por cliente. Documentado como límite asumido en `docs/multitenancy.md`. |
| 8 | Commit limpio del core endurecido antes de copiar la vertical | ⏳ pendiente (Fidel decide) | Punto reproducible para el fork. |

---

## Siguiente paso

**Detenido en Fase 2.** Correcciones de Fidel aplicadas (Client/Product no se
renombran; Deal se oculta; ver el recuadro arriba). La skill
`references/vertical-mapping.md` ya quedó actualizada con el principio
"keep the core generic".

**Pendiente de aprobación explícita de Fidel** para:
- (a) generar el roadmap de slices de la vet (Fase 3), y/o
- (b) ejecutar el endurecimiento del core en el proyecto base (tabla de arriba).

No se toca código hasta el visto bueno.
