# Core reutilizable

Este proyecto es la **base** de la que se copian las verticales (veterinaria,
inmobiliaria, RRHH, car wash, …). Este documento marca la frontera entre lo que
es **core** (se mejora acá, se hereda en todas partes) y lo que es **específico
de un vertical** (se agrega en la copia, sin tocar el core).

## Regla

> **Keep the core generic.**
> Una vertical *extiende* el core: agrega entidades y roles encima. **No renombra
> ni convierte** las entidades genéricas. `Client` es `Client` en todas las
> verticales — una veterinaria le pone la etiqueta "Propietario" en la UI y le
> agrega un `Patient` relacionado, no renombra la tabla.
> Los módulos que no aplican hoy pero podrían servirle a un cliente más grande
> **se ocultan** con el plan gate, no se borran.

Detalle del razonamiento y ejemplos por vertical:
`~/.claude/skills/project-reuse-orchestrator/references/vertical-mapping.md`.

---

## FIDEL CORE (infra — genérico para cualquier negocio)

| Área | Backend | Frontend |
|---|---|---|
| **Auth** | `AuthController`, Sanctum SPA (`config/sanctum.php`, `bootstrap/app.php` `statefulApi`), reset de password, `SecurityHeaders` middleware, scrub de excepciones en `bootstrap/app.php`, rate limiters (`AppServiceProvider`) | `lib/api.ts` (axios + CSRF), `lib/auth.ts`, `app/login`, `app/forgot-password`, `app/reset-password`, `components/layout/auth-split-layout` |
| **Empresas / config** | `Company`, `CompanyController`, `Concerns/ResolvesCompany` | `app/app/configuracion` |
| **Usuarios** | `User`, `UserController`, `StoreUserRequest`, `UpdateUserRequest` | `app/app/usuarios` |
| **Roles / permisos** | Spatie wiring, `RoleController`, `/permissions`, convención `can:` en rutas, seeder de roles/permisos | `lib/auth.ts` `hasAnyPermission`, `app/app/roles`, gating de nav en `admin-shell.tsx` |
| **Auditoría** | `AuditLog`, `AuditService`, `AuditLogController` | `app/app/auditoria` |
| **Motor CRUD** | `BaseCrudController`, `ApiFormRequest`, `TableQueryService`, `Http/Resources/*` (patrón), `Rules/ImageFile` | `components/module-table-page.tsx`, `components/crud/crud-modal.tsx`, `components/data-table/data-table.tsx`, `lib/use-api-table.ts`, `lib/table-types.ts` |
| **Archivos** | `ProductController::image` (patrón), `Rules/ImageFile`, path aislado por empresa | `components/crud/product-image-action` (patrón) |
| **Exportaciones** | `ExportController`, vista `exports.table` | botones CSV/PDF en `data-table.tsx` |
| **Contingencia (offline)** | `ContingencySession`, `ContingencyEvent`, `ContingencyController`, `Concerns/HandlesContingencySync`, `Support/ContingencyModuleRegistry` | `lib/contingency/*`, `components/layout/contingency-banner.tsx`, `app/app/contingencia` |
| **Plan gating** | — | `lib/plan.ts` (mecanismo), filtros en `admin-shell.tsx` |
| **UI kit / tema** | — | `components/ui/*`, `components/theme-provider.tsx`, `app/globals.css` (tokens), `components/brand/logo.tsx` |
| **Shell de marketing + SEO** | — | `components/marketing/{MarketingLayout,PageHero,Section,Reveal,ProductPage,LegalPage}`, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`, `app/icon.tsx`, `lib/site.ts` |
| **Captura de leads / form público → CRM** | `Lead`, `LeadController`, `StoreLeadRequest`, `LeadPanelRequest` | `components/marketing/{contact-form,lead-fields}`, `lib/catalog.ts` |
| **Deploy** | `docs/hostinger-deployment.md`, `config/cors.php` (leído de env), `.env.example` | `next.config.ts`, Vercel env |
| **Integridad referencial** | patrón `2026_09_06_000009_harden_referential_integrity` (RESTRICT en históricos, snapshots name/sku) | — |
| **Multiempresa** | `Concerns/ResolvesCompany`, convención `company_id` + `where` manual — ver `docs/multitenancy.md` | — |
| **Borrado / archivado** | 4 niveles — ver `docs/soft-delete-strategy.md` | — |

**Al copiar a un vertical: NO se toca nada de esta tabla,** salvo para mejorar el
core (y entonces el cambio vuelve al proyecto base).

---

## CRM CORE (entidades de negocio genéricas — NO se renombran)

`Leads`, `Clientes` (`Client` + `Contact` + `ClientNote` + `Segment`),
`Cotizaciones` (`Quote`/`QuoteItem`), `Actividades` (`Activity` + vistas Tareas /
Seguimientos / Calendario), `Deals` (`Deal`), `Pedidos` (`Order`/`OrderItem`).

- Un vertical **relabela** (UI) y **extiende** (campos, entidad relacionada).
- Un vertical **oculta** vía `lib/plan.ts` lo que no usa hoy (ej. `Deal` +
  pipeline en una veterinaria chica).
- Backend: `app/Models/{Client,Contact,ClientNote,Segment,Deal,Activity,Order,Quote,Lead}.php`,
  `app/Http/Controllers/Api/{Client,Contact,ClientNote,Segment,Deal,Activity,Order,Quote,Lead}Controller.php`.
- Frontend: `app/app/{leads,clientes,contactos,segmentos,notas,deals,cotizaciones,actividades,tareas,seguimientos,calendario,pedidos}`.

---

## INVENTARIO CORE (entidades de negocio genéricas — NO se renombran)

`Productos` (`Product` + `Category` + `Brand` + `Unit`), `Bodegas` (`Warehouse`),
`Movimientos` (`StockMovement` — stock = `SUM(quantity)`), `Transferencias`
(`StockTransfer`), `Proveedores` (`Supplier`), `Compras`
(`PurchaseOrder`/`PurchaseOrderItem`), alertas de stock (`StockAlertController`),
catálogo público (`PublicCatalogController` + `app/catalogo/*`).

- Un vertical agrega un clasificador y campos a `Product` (ej. vet: `kind`, lote,
  vencimiento), no lo renombra.
- El catálogo público es un mecanismo (anónimo → carrito → quote/lead → CRM)
  reutilizable como "reservá tu cita".
- Backend: `app/Models/{Product,Category,Brand,Unit,Warehouse,StockMovement,StockTransfer,Supplier,PurchaseOrder}.php`.
- Frontend: `app/app/{productos,categorias,marcas,unidades,bodegas,movimientos-inventario,transferencias,alertas-stock,proveedores,ordenes-compra}`, `app/catalogo/*`.

---

## VERTICAL-SPECIFIC (se agrega en la copia, no vive en el base)

Todo lo que sea identidad del negocio destino. Para la veterinaria (ver
`docs/adaptacion-veterinaria.md`):

Especies, Razas, Pacientes/Mascotas (`belongs to Client`), Citas/Agenda (modelo
real; el Calendario core pasa a ser una vista), Historia clínica / Consultas
(SOAP), Vacunas y Desparasitación (acto clínico, distinto del producto de
inventario), Prescripciones, Procedimientos, Diagnósticos, Tratamientos,
Laboratorio, Hospitalización, Documentos clínicos, Reportes clínicos.

Más: los campos vet en `Product`, la relación `Patient↔Client`, el label
"Propietario", el copy de marketing, la paleta/branding, y los sets de
`lib/plan.ts` que ocultan lo que esa vertical no usa.

Estos módulos:
- se montan sobre el **motor CRUD** (migración + modelo + controller que extiende
  `BaseCrudController` + `Store*Request` + Resource + ruta + permiso + un
  `ModuleTablePage`);
- los que sean dato médico/legal usan **soft-delete** (nivel 4 de
  `docs/soft-delete-strategy.md`);
- no modifican ninguna entidad del CRM/Inventario core salvo por relabel + campos.

---

## Antes de forkear un vertical nuevo

1. El core debe estar con **baseline verde** y un **commit limpio** (punto
   reproducible).
2. Revisar `docs/multitenancy.md` y `docs/soft-delete-strategy.md` — decidir si
   la vertical necesita algo que hoy el core no tiene y, si aplica a todas,
   agregarlo **acá** primero.
3. Recién entonces: copia / rama del vertical → roadmap del vertical → slices.

## Cuándo extraer el core a un paquete

**No antes de tener 3+ verticales en producción.** Con 1–2, el esquema
base → copia → adaptación es más simple. Con 3+, un paquete Composer + npm hace
que un fix de seguridad se propague sin portarlo a mano.
