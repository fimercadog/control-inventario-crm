# Plan Low Ticket — qué es y cómo funciona

Variante comercial mínima para pequeños negocios. Vive en la rama `low-ticket`
(creada desde `plan/base`). No borra nada del sistema completo: oculta módulos
en el frontend y los bloquea en la API por plan.

## Objetivo

Resolver un solo flujo, sin sentirse un ERP ni un CRM corporativo:

> Cliente → Cotización → Pedido → Inventario

## Funciones incluidas

Menú del panel (Dashboard + 9, ver nota sobre Contingencia abajo):

```text
Inicio
└── Dashboard

Ventas
├── Clientes
├── Cotizaciones
└── Pedidos

Inventario
├── Productos
├── Categorías
└── Movimientos

Herramientas
└── Modo contingencia   → botón "Premium" bloqueado (gancho de venta)

Mi negocio
└── Configuración
```

Dashboard: 6 indicadores (ingresos del mes, pedidos del mes, clientes,
productos, stock bajo, cotizaciones pendientes) + gráfico de ingresos + top
productos por existencia + lista de productos con stock bajo. Sin pipeline de
deals, sin actividad/auditoría.

Formularios simplificados (FASE 4): Productos sin Marca/Unidad, Clientes sin
Segmento, Cotizaciones y Pedidos sin Deal — todos campos opcionales en el
backend, así que quitarlos del formulario no rompe nada.

## Funciones excluidas (ocultas, no borradas)

| Módulo | Motivo | Se reactiva con |
| --- | --- | --- |
| Leads, Contactos, Segmentos, Notas, Deals, Actividades, Tareas, Seguimientos, Calendario | Seguimiento comercial avanzado | `Feature::CrmPro` |
| Marcas, Unidades, Bodegas, Proveedores, Transferencias, Alertas de stock, Órdenes de compra | Inventario/compras avanzado | `Feature::InventoryPro` |
| Reportes, Reportes comerciales | Analítica | `Feature::Analytics` |
| Usuarios adicionales | 1 usuario principal por empresa en esta versión | `Feature::Team` |
| Asistente IA, Auditoría, Roles | Premium | `Feature::Premium` |
| Modo contingencia | Visible, pero bloqueado como "Premium" (candado + modal explicativo) | `Feature::Premium` |

## Landing / sitio público

El sitio público (`frontend/src/app/*` fuera de `/app`, `frontend/src/components/marketing/`)
es **intencionalmente idéntico a `master`** — mismo copy, mismas secciones,
mismos componentes (`page-hero.tsx`, `cta-link.tsx`, `widget-card.tsx`,
`gradient-blob.tsx`, `hero-backdrop.tsx` vueltos a la versión de `master`; se
borró `shape-scatter.tsx`, que era exclusivo del reskin "App Developer" de
`plan/base` y ya no se usa). Lo único que cambia es la tonalidad de color.

### Identidad visual (solo `low-ticket`)

Acento **azul** (`#2563eb`) en vez del verde de `master` o el indigo/coral
"App Developer" de `plan/base`, para que esta variante se distinga a simple
vista. Mismo mecanismo que `plan/base` (ver `docs/plan-base.md`):

- Scopeado a `.site-theme` en `globals.css` — el panel privado (`:root` /
  `.dark`) no cambia, solo el sitio público y el login.
- Tipografía: Roboto en todo (a diferencia de `plan/base`, que usaba Poppins
  para titulares — se quitó el font `Poppins` de `layout.tsx` y la regla que
  lo aplicaba, porque acá la única diferencia pedida es de color, no de
  tipografía).
- Contenido, textos, rutas, formularios y componentes: idénticos a `master`.
- **No mergear a `master`.** Al rebasar `low-ticket`, conservar solo los
  cambios de `globals.css` (bloque `.site-theme` + gradiente
  `.animate-marketing-gradient-text`).

## Arquitectura de planes

Mismo mecanismo en frontend y backend: **un despliegue = un plan**, fijado por
variable de entorno (no hay cambio de plan en caliente por empresa; para eso
haría falta una columna `plan` en `companies` — no existe hoy, no se agregó
porque no hace falta para este modelo comercial de "una rama = un cliente",
igual que `plan/base` y `vertical/veterinaria`).

### Frontend — `frontend/src/lib/plan.ts`

- `PlanTier`: `low_ticket | basic | pro | premium` (solo `low_ticket` y
  `premium` se usan hoy; `basic`/`pro` quedan tipados para vender por módulos).
- `currentPlan()`: `low_ticket` por default en esta rama; `NEXT_PUBLIC_PLAN=full`
  para previsualizar el sistema completo.
- `LOW_TICKET_HIDDEN`: rutas ausentes del menú y bloqueadas si se escriben a mano
  (`admin-shell.tsx` ya traía este guard de `plan/base`, se reutiliza tal cual).
- `LOW_TICKET_LOCKED`: rutas visibles pero con candado "Premium" (hoy solo
  `/app/contingencia`, mismo componente `PREMIUM_INFO` que ya existía).

### Backend — `backend/app/Support/Plan/`

- `PlanTier` (enum): mismo concepto, resuelto desde `config('plan.tier')`
  (`config/plan.php`, lee `PLAN_TIER` del `.env`, default `low_ticket`).
- `Feature` (enum): `CrmPro | InventoryPro | Analytics | Team | Premium`, cada
  uno con su `minTier()`. Mapa único feature → tier mínimo — un solo lugar,
  no condicionales sueltos por controlador.
- `PlanService::has(Feature)`: compara el tier actual contra el mínimo del
  feature.
- Middleware `plan:<feature>` (`EnsurePlanFeature`, alias registrado en
  `bootstrap/app.php`): 403 si el plan no incluye el feature. Se declara junto
  al `can:` de permisos existente en `routes/api.php`, ej.
  `->middleware(['can:deals.manage', 'plan:crm_pro'])`.
- `ExportController`: mismo criterio vía `featureByResource` — la ruta genérica
  `/exports/{resource}.{format}` también bloquea `deals`, `suppliers`,
  `purchase-orders` y `audit-logs` para el plan low ticket, no solo el CRUD.

**Por qué dos gates (frontend + backend) y no uno solo:** ocultar en el menú
es UX (evita una tabla rota o un 403 crudo); el 403 real de la API es
seguridad. Antes de esta rama, `plan/base` documentaba el backend como
"pendiente" — acá se cerró: un usuario con permiso Spatie pero plan
insuficiente recibe 403 igual, así entre por la UI o por URL/API directa.

## Cómo activar otro plan

**Frontend** (`frontend/.env`): `NEXT_PUBLIC_PLAN=full` → sistema completo.
**Backend** (`backend/.env`): `PLAN_TIER=full` (se normaliza a `premium`
internamente) → misma API sin restricciones de plan.

Las dos variables deben coincidir en un despliegue real — si difieren, el
menú y lo que la API permite quedan desalineados (ej. un botón visible que
devuelve 403).

Vender un add-on a un cliente puntual: mover el feature correspondiente de
`Feature::minTier()` a un tier más bajo, o (más simple hoy, ya que solo hay
low_ticket/premium en uso) subir su `PLAN_TIER` a `full`.

## Decisiones técnicas

- **Rama nueva sobre `plan/base`, no sobre `master`**: parte de un estado ya
  probado (mismo mecanismo de gate por plan) en vez de reinventar el patrón.
  El reskin visual "App Developer" de `plan/base` se revirtió a los
  componentes de `master` — ver "Landing / sitio público" arriba — y se
  reemplazó por el acento azul propio de esta rama.
- **Bodegas y Movimientos**: el formulario de Movimientos/Pedidos ya pedía un
  "ID de bodega" numérico crudo (no un selector poblado desde `/api/warehouses`),
  así que ocultar la página de Bodegas no rompe el flujo — el despliegue se
  entrega con una sola bodega ya seedeada y el usuario nunca necesita crear
  una segunda. **Límite conocido:** ese campo sigue siendo técnico (pedirle a
  un dueño de negocio un ID numérico no es ideal); una mejora futura sería
  autocompletar la bodega única y ocultar el campo del todo.
- **`/api/public/leads` no se bloqueó**: es el formulario de contacto del sitio
  público (no autenticado). Bloquearlo rompería el formulario de contacto del
  landing; los Leads que genere quedan en la base de datos sin una pantalla
  para verlos en esta variante (dato inerte, no un error visible).
- **Usuarios**: se trató como Pro (`Feature::Team`) y no Premium, siguiendo la
  jerarquía que pide el brief ("usuarios adicionales — PRO").
- **Dashboard**: se agregaron dos métricas nuevas al backend
  (`total_products`, `pending_quotes` en `DashboardController`) porque el
  brief pedía "Productos" y "Cotizaciones pendientes" como indicadores y no
  existían — mismo patrón que las métricas ya existentes (`count()` por
  compañía), sin tocar el resto del endpoint.
- **Tests**: `phpunit.xml` fija `PLAN_TIER=premium` para el entorno de test,
  así los 117 tests existentes (escritos para el sistema completo) siguen
  pasando sin cambios. El gate low ticket se prueba explícitamente en
  `tests/Feature/PlanGateTest.php`, que fuerza `config(['plan.tier' => ...])`
  por caso.

## Qué quedó pendiente

- **Landing**: por decisión explícita, el sitio público NO tiene copy propio
  de low ticket — es el mismo de `master` (ver "Landing / sitio público"
  arriba). Si más adelante se quiere un mensaje comercial distinto para este
  plan (enfocado en Clientes/Cotizaciones/Pedidos/Inventario, sin CRM
  avanzado/Compras/IA), hay que reescribirlo — no está hecho.
- Campo "ID de bodega" en Movimientos/Pedidos sigue siendo un número crudo
  (ver Decisiones técnicas).
- No se tocó el modelo de datos (`companies` sin columna `plan`): el modelo
  sigue siendo "una rama/deploy = un plan", no multi-tenant con planes por
  empresa en la misma base de datos.
