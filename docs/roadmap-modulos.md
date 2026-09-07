# Roadmap de módulos (backlog acordado)

Todo lo de abajo se construye **de punta a punta**: migración + modelo + controlador +
Form Request + Resource + ruta + permiso Spatie + seeder en el backend, y página
CRUD + entrada de nav en el frontend, con tests del flujo crítico.

## Inventario — faltan

| Módulo | Notas de implementación |
| --- | --- |
| Categorías | Catálogo simple (`CatalogPage`). FK `category_id` en `products`. |
| Marcas | Catálogo simple. FK `brand_id` en `products`. |
| Unidades de medida | Catálogo simple (unidad, caja, kg, litro…). FK `unit_id` en `products`. |
| Transferencias entre bodegas | Mueve stock bodega→bodega en una transacción; genera 2 movimientos (salida+entrada). |
| Lotes / vencimientos | Cambio de esquema en stock (lote, fecha vto.). Alertas por vencimiento próximo. Según negocio. |
| Alertas de stock (vista dedicada) | Lectura sobre `reorder_level` / stock: mínimos, agotados, sobrestock. |

## CRM — faltan

| Módulo | Notas |
| --- | --- |
| Contactos | Personas ligadas a un cliente/empresa. Nueva entidad. |
| Seguimientos | Hoy es un *tipo* de actividad; puede ser vista filtrada + campo "próximo contacto". |
| Cotizaciones | Nueva entidad; se puede convertir en pedido. |
| Historial del cliente | Vista agregada (deals + actividades + pedidos + notas) por cliente. |
| Notas | Nueva entidad, ligada a cliente/deal. |
| Tareas | Subconjunto de actividades (pendientes del vendedor). |
| Calendario | Vista sobre actividades (citas, llamadas, reuniones). |
| Segmentación | Tags / segmentos de cliente. |
| Reportes comerciales | Conversión, ventas por vendedor, embudo. Endpoints nuevos. |
| WhatsApp Web | Botón que abre `https://web.whatsapp.com/send?phone=…&text=…` (o `wa.me`) con el teléfono del cliente/contacto y un mensaje prellenado. Sin backend extra. |

## Catálogo público — hecho (rama `feature/catalogo-publico`)

Sitio de marketing → CRM, todo end-to-end + tests.

- **Backend**: `products` gana `description` / `image_url` / `is_public` (solo `is_public && active`
  se muestra en el sitio); `quotes` gana `source` (`internal` | `catalog`).
  `PublicCatalogController` (sin auth, `throttle`, `ResolvesCompany`):
  `GET /public/catalog/products|products/{id}|categories` con `PublicProductResource` (sin costo ni stock)
  y `POST /public/catalog/quote-requests` → `Client::firstOrCreate` por email + `Quote` `draft`
  `source=catalog` con `quote_items` (snapshot nombre/sku/precio), consentimiento Ley 1581 obligatorio.
  Seeder marca 6 productos como públicos con descripción. 6 tests (`PublicCatalogTest`).
- **Frontend**: `/catalogo` (grid + filtro por categoría + búsqueda), `/catalogo/[id]` (ficha),
  `/catalogo/cotizacion` (carrito editable + formulario + consent). Carrito en `localStorage`
  vía `useSyncExternalStore` (`lib/catalog-cart.tsx`). Nav "Catalogo" + sitemap.
  Panel: form de Productos con descripción / URL imagen / "visible en catálogo"; columna "Público".
  Lista de Cotizaciones con badge de origen ("Sitio web" / "Interna").
- **Pendiente menor**: E2E Playwright del flujo público; subir imágenes reales (hoy `image_url` es una URL manual).

## Contingencia Básica (con cola local de transacciones)

Diseño acordado por el dueño. Nombre visible: **"Contingencia Básica"**.

### Módulos elegibles
- **Productos**: crear / editar / consultar local.
- **Oportunidades**: crear / editar / consultar local.
- Cada creación o edición → **transacción local pendiente** (nunca auto-sync).

### Regla técnica base
Cada transacción guarda una **copia del registro tal como estaba al iniciar la
contingencia** (versión base). Con eso se hace merge a 3 vías al reconectar:
`base` vs `servidor` vs `offline`. Si `servidor != base` → alguien más lo cambió
mientras el usuario estaba offline → **conflicto**.

### Al reconectar — "RESOLVER CONTINGENCIA"
Bandeja de pendientes. El usuario abre **una por una**:

- **Sin conflicto** (`servidor == base`): botón `Sincronizar`.
- **Con conflicto** (`servidor != base`): opciones
  - **Sincronizar** — aplica la versión offline tal cual (si es válida).
  - **Ajustar** — editar los datos antes de sincronizar.
  - **Descartar** — elimina la transacción local, conserva lo del servidor (exige razón escrita).
  - **Resolver** — comparación **campo por campo**: por cada campo distinto,
    elegir *Mantener servidor* / *Usar contingencia* / *Escribir otro valor*.
    Luego `Guardar y sincronizar`.

### Flujo
```
Se pierde internet → Contingencia → crear/editar Productos y Oportunidades
→ guardar localmente → transacción pendiente
Vuelve internet → usuario revisa cada transacción → comparar contra servidor
→ ¿conflicto? → NO: Sincronizar / SÍ: Resolver (Ajustar | Descartar | Sincronizar)
```

### Reglas de la skill `contingency-mode` que aplican
- Sincroniza por el **endpoint real** del módulo + `client_uuid` (idempotencia,
  `firstOrCreate` en backend). Nunca una ruta de escritura paralela.
- Storage local durable (IndexedDB), detrás de `get/put/remove`.
- **Bloqueo duro** de la desactivación mientras haya pendientes/conflictos > 0 (se
  calcula en el cliente).
- Banner persistente mientras está activa (nombre, módulos, nº de pendientes,
  quién y cuándo, link a gestionar). Escala de color si hay conflicto/fallo.
- Endpoints `/contingency/*` detrás de auth; activar/desactivar exige
  `settings.manage`; leer estado lo puede cualquier autenticado.
- Nav a nivel superior (ya está en "Herramientas"), ícono `WifiOff`.

## Orden de ejecución

1. ✅ **Catálogos de inventario** (Categorías + Marcas + Unidades) + FKs en `products`. — hecho, con tests.
   1b. ✅ **Wire productos → catálogos**: form con selects dinámicos (`CrudField.optionsResource`), se eliminaron las columnas string `category`/`unit`. Export de productos ya no incluye `category` (pendiente re-agregar como nombre).
2. ✅ **Alertas de stock** (`GET /stock-alerts`, vista solo lectura) + **Transferencias entre bodegas** (`stock-transfers`, genera 2 movimientos en transacción). — hecho, con tests.
3. **CRM**:
   - ✅ **Contactos** (`contacts`, ligados a cliente) — con tests.
   - ✅ **Notas** (`client-notes`, bitácora solo-alta con autor) — con tests.
   - ✅ **WhatsApp Web** — `lib/whatsapp.ts` + `WhatsAppAction` en Clientes y Contactos.
   - ✅ **Tareas** (`/app/tareas` = `/activities?completed=0` + acción "Completar"), **Seguimientos** (`/activities?type=followup`), **Calendario** (`/app/calendario`, actividades pendientes por fecha). Se añadieron los tipos `task`/`followup` a Activity y selects dinámicos cliente/deal. Con tests.
   - ✅ **Cotizaciones** (`quotes` + `quote_items`): CRUD + líneas + `send` / `respond` (accepted|rejected) / `convert` (crea un pedido borrador). Lista `/app/cotizaciones` + detalle `/app/cotizaciones/[id]`. Con tests.
   - ✅ **Segmentación** (`segments` catálogo + `segment_id` en `clients`, filtro y columna). Con tests.
   - ✅ **Historial del cliente** (`GET /clients/{id}/history` agrega deals + actividades + pedidos + cotizaciones + notas; página `/app/clientes/[id]`, link "Historial" en la tabla). Con tests.
4. ~~WhatsApp Web~~ (hecho en el slice 3).
5. ✅ **Reportes comerciales** (`GET /reports/commercial`): embudo + tasa de cierre, ventas por vendedor (se añadió `owner_id` a `deals` y `orders`, default al creador), cotizaciones (tasa de aceptación), ventas por producto. Página `/app/reportes-comerciales`. Con tests.
6. ✅ **Contingencia Básica** (Productos + Oportunidades):
   - Backend: `client_uuid` (uuid único) en `products` y `deals`; `HandlesContingencySync` en `BaseCrudController` → alta idempotente (`firstOrCreate` por `client_uuid`) y, en edición, detección de conflicto contra `base_snapshot` → **409** con `{conflict, fields:{campo:{server,base}}, server}`. `force:true` lo aplica igual (resolver).
   - `ContingencyModuleRegistry` ahora expone `products` y `deals`.
   - Frontend: `QueuedTx` con `op`/`recordId`/`baseSnapshot`/`conflict`; adapters de products/deals con `ContingencyConflictError`; `context` con `enqueue(opts)`, `syncOne` que marca `status:"conflict"`, y `resolveConflict`. `CrudModal`/`ModuleTablePage` encolan **crear y editar** (el snapshot base = la fila actual). Página `/app/contingencia` "Resolver contingencia": por transacción → Sincronizar / **Resolver** (modal campo por campo: Mantener servidor / Usar contingencia / Otro valor) / Descartar. Bloqueo de desactivación mientras haya pendientes/conflictos.
   - 5 tests backend. Pendiente menor: opción "Ajustar" (editar payload completo antes de sincronizar) — hoy el "Otro valor" por campo lo cubre parcialmente; E2E Playwright del flujo offline.
7. **Lotes / vencimientos** (si el negocio lo pide) — pendiente.

### Otros arreglos de la sesión
- **Bug login**: `.site-theme` redefinía las variables pero no re-aplicaba `color`/`background-color`; con el SO en oscuro el subárbol heredaba el texto claro del `body` → título y textos invisibles. Se añadió `color: var(--foreground); background-color: var(--background)` a `.site-theme` + `text-foreground` al `<main>` de `auth-split-layout`.

### Deuda menor abierta
- Export CSV de productos ya no incluye `category` (era string; ahora es FK). Re-agregar como nombre requiere que `ExportController` soporte accesores con relación.
- `cotizaciones/[id]/page.tsx` tiene el mismo warning de lint `set-state-in-effect` que las otras 3 páginas de detalle del repo (patrón aceptado).
