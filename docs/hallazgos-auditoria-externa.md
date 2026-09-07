# Hallazgos — Auditoría externa (2026-09-07)

Estado de los 10 hallazgos del informe. Los corregidos llevan test de regresión.

| ID | Estado | Nota |
| --- | --- | --- |
| AUD-01 | ✅ Corregido | Red de seguridad en `bootstrap/app.php`: ninguna respuesta de `api/*` expone stack trace / rutas / usuario del SO / clases del framework, ni con `APP_DEBUG=true`. |
| AUD-02 | ✅ Corregido | Subida de imágenes: validación por contenido (`App\Rules\ImageFile` con `getimagesize`, sin `fileinfo`) → siempre `422` ante archivo inválido, nunca `500`. |
| AUD-03 | ✅ Corregido | Nuevo permiso `clients.delete`. Ventas ya no hace hard-delete de clientes; solo roles administrativos. |
| AUD-04 | ✅ Corregido (Opción A, aprobada 2026-09-07) | Contacto nuevo del catálogo → `status = inactive`. Cliente existente activo → no se degrada. Ver "Ronda 2" abajo. |
| AUD-05 | ⏳ Pendiente de verificación manual | "Posible problema de escritura en el login" — probable artefacto de automatización. Sin cambios. Revisar manualmente si vuelve a aparecer. |
| AUD-06 | ⏳ Pendiente (gap funcional menor) | No existe `DELETE /products/{id}/image`. No es vulnerabilidad. Al reemplazar una imagen la anterior sí se borra (`ProductController::image`); falta solo el "quitar imagen" explícito. Añadir cuando se priorice el CRUD de catálogo. |
| AUD-11 | ✅ Corregido (Ronda 4) | `image_url` era fijable como URL externa arbitraria por el payload de `POST/PUT/PATCH /products`. Ahora no es fillable y la regla salió del Form Request: la imagen del catálogo solo la fija el servidor por `POST /products/{id}/image`. Ver "Ronda 4". |
| AUD-07 | ⏳ Pendiente decisión | Visibilidad de clientes/cotizaciones entre vendedores. No se toca hasta definir la regla de negocio (¿cada vendedor ve solo lo suyo? ¿el equipo? ¿el jefe?). |
| AUD-08 | ✅ Verificado, sin cambios | `company_id` en `POST /api/public/catalog/quote-requests` se resuelve en el servidor (`ResolvesCompany` + `StorePublicQuoteRequest`), nunca del payload. Igual que `status`, `client_id`, `owner_id`. Test de regresión añadido. |
| AUD-09 | — No aplica | Nada demostrado que corregir. |
| AUD-10 | ✅ Verificado, sin cambios | `login` regenera sesión, `logout` la invalida, una sesión invalidada no se reutiliza. 3 tests de regresión añadidos (`AuthSecurityTest`). |

## AUD-04 — Cotización pública crea Cliente activo sin verificación

### Flujo actual

`POST /api/public/catalog/quote-requests` → `PublicCatalogController::storeQuoteRequest`:

1. `StorePublicQuoteRequest` valida nombre, email, consentimiento (Ley 1581) y líneas
   (cada `product_id` debe ser un producto público y activo del tenant).
2. Dentro de una transacción:
   - `Client::firstOrCreate(['company_id', 'email'], ['name', 'company_name', 'phone', 'status' => 'active'])`
     → **crea un Cliente con `status = 'active'`** si el email es nuevo.
   - Crea una `Quote` `status = 'draft'`, `source = 'catalog'`.
3. Rate limit: `throttle:catalog-quote` por IP.

No pasa por `Leads`. Un visitante anónimo no verificado que envía el formulario
queda como **cliente activo** en el CRM, contando en métricas y listados de clientes.

### Modificación mínima propuesta (a aprobar)

**Opción A (recomendada, cambio de 1 línea + migración de dato opcional):**
crear el cliente del catálogo con `status = 'inactive'` (o un estado nuevo
`prospect`) en vez de `'active'`. El cliente existe, la cotización se le asocia,
pero no infla el conteo de clientes activos hasta que un humano del equipo lo
active al dar seguimiento.

- Cambio: en `storeQuoteRequest`, `'status' => 'active'` → `'status' => 'inactive'`
  en el `firstOrCreate` (solo aplica a clientes nuevos; si el email ya era cliente
  activo, se respeta).
- `BaseCrudController::index` y los reportes ya filtran por `status` donde
  corresponde; revisar `ReportController` / dashboard para que "clientes activos"
  excluya `inactive` (probablemente ya lo hace).
- Sin migración obligatoria; opcionalmente un `UPDATE` puntual para los clientes
  ya creados por el catálogo (`source` de su Quote = `catalog` y sin otra
  actividad).

**Opción B (más trabajo):** el formulario público crea un `Lead`
(`source = 'catalog'`) con los ítems serializados en el cuerpo/nota, y la
conversión Lead → Cliente + Quote la hace un usuario del CRM con un botón
"Convertir". Reusa el módulo de Leads existente. Cambia el contrato del front
del catálogo (hoy espera 201 + mensaje de éxito con la cotización ya creada).

**Recomendación:** Opción A. Mantiene el flujo y el UX actuales, ataca
exactamente el problema (clientes activos inflados) y es reversible.

---

## Ronda 2 (2026-09-07) — AUD-04 aprobado + concurrencia

### AUD-04 — Opción A implementada

[`PublicCatalogController::storeQuoteRequest`](../backend/app/Http/Controllers/Api/PublicCatalogController.php):
`Client::firstOrCreate(..., ['status' => 'inactive'])`. Un contacto nuevo del
catálogo entra como **prospecto inactivo**. Si el correo ya pertenece a un
cliente, `firstOrCreate` lo devuelve **sin tocar su estado ni sus datos** (no lo
degrada a `inactive`). La cotización se asocia igual.

Sin migración de datos (la BD de demo se reseedeó). El listado `/app/clientes` no
filtra por estado por defecto, así que el prospecto sigue siendo visible en el CRM.

**Tests** ([`PublicCatalogTest`](../backend/tests/Feature/PublicCatalogTest.php)):
- `test_a_new_client_from_the_public_catalog_is_created_inactive` — contacto nuevo → `status = inactive`, la Quote queda asociada.
- `test_an_existing_active_client_is_not_downgraded_by_a_public_quote_request` — cliente activo con ese correo → sigue `active`, nombre intacto, sin duplicado.

### Condición de carrera en `Client::firstOrCreate` (hallazgo de code-review)

**Problema:** el get-or-create del cliente corría **dentro** de `DB::transaction()`.
Bajo MySQL/MariaDB (REPEATABLE READ, el default), la transacción fija su snapshot
en la primera lectura; si dos solicitudes con el mismo correo entran casi a la
vez, la perdedora del `unique(company_id, email)` no ve la fila commiteada por la
ganadora en su re-lectura de recuperación → `firstOrCreate` lanza → rollback → el
visitante recibe un error y su solicitud se pierde.

**Solución (correcta, no workaround de SQLite):** mover el get-or-create **fuera**
de la transacción de la cotización. Fuera de una transacción, el `INSERT` de
`firstOrCreate` es autocommit y su recuperación tras un `UniqueConstraintViolation`
(`Builder::createOrFirst`, Laravel 12) hace un `SELECT` fresco que **sí** ve la
fila commiteada por la otra solicitud — correcto en MySQL, MariaDB, Postgres y
SQLite. La transacción ahora envuelve solo `Quote` + líneas. Se eliminó el
`try/catch (QueryException)` manual que reimplementaba mal `createOrFirst`.

Para no dejar un cliente huérfano si la cotización falla, la verificación de
"todos los productos siguen disponibles" (único punto de fallo realista, `422`)
se hoistó **antes** de crear el cliente.

**Qué quedó cubierto por tests / qué no:**

| | Cobertura |
| --- | --- |
| El get-or-create corre **fuera** de la transacción de la cotización | ✅ `test_client_is_created_outside_the_quote_transaction` — fuerza el fallo de `Quote::create`; el cliente (creado antes/fuera) **sobrevive** al rollback. Verificado que **falla** si se revierte el fix (cliente dentro de `DB::transaction` → el rollback lo borra). |
| Reutilización del cliente cuando el correo ya existe (caso común) | ✅ `test_repeat_request_does_not_duplicate_client` |
| Recuperación de `firstOrCreate` ante `UniqueConstraintViolation` | ✅ Cubierto por la suite del propio framework (`Builder::createOrFirst`) |
| El snapshot **REPEATABLE READ de MySQL/MariaDB** que causaba el fallo original | ❌ **No reproducible** en el entorno de test: SQLite `:memory:`, conexión única, envuelta por `RefreshDatabase` (transacción siempre abierta), sin niveles de aislamiento equivalentes. La corrección es **estructural** (sacar el código de la transacción) y esa propiedad sí está cubierta arriba. Una verificación end-to-end real requeriría MySQL + dos conexiones concurrentes. |

### e2e — fix de encoding

[`e2e/catalogo_publico.py`](../e2e/catalogo_publico.py): `sys.stdout/stderr.reconfigure(encoding="utf-8")` al inicio. Antes reventaba con `UnicodeEncodeError` en Windows (consola cp1252) al imprimir `✓`/acentos salvo que se exportara `PYTHONIOENCODING=utf-8` a mano. Ahora corre normal.

---

## Ronda 3 (2026-09-07) — aislamiento de imágenes + migración del permiso

### Aislamiento de archivos de imagen entre empresas (hallazgo de code-review)

**Problema:** `image_url` es una columna de texto libre (se puede fijar por el
payload de `POST/PUT /products`). Un admin de la empresa A podía apuntar el
`image_url` de su producto al archivo de la empresa B dentro del disco compartido
`storage/app/public/products/`; al subir un reemplazo, `ownStoragePath` aceptaba
esa ruta (empezaba con `products/`, sin `..`) y `Storage::delete` borraba el
archivo de B. Los nombres aleatorios de 40 chars eran la única barrera práctica —
no es un control de seguridad.

**Fix (mínimo, coherente con la arquitectura):** las imágenes de producto ahora
viven en **`products/{companyId}/`** ([`ProductController::image`](../backend/app/Http/Controllers/Api/ProductController.php)).
`ownStoragePath($imageUrl, $companyId)` solo devuelve una ruta si está dentro de
`products/{companyId}/` — un `image_url` apuntando a `products/{otraEmpresa}/…` o
a la ruta plana vieja `products/…` devuelve `null` y **nunca** llega a
`Storage::delete`. La propiedad/autorización del archivo queda determinada
server-side por `company_id`, no por el nombre ni por el payload. No se tocó nada
más del CRUD de productos (sin implementación general multiempresa).

**Tests** ([`ProductImageIsolationTest`](../backend/tests/Feature/ProductImageIsolationTest.php)):
- `test_a_product_manages_its_own_image` — sube, reemplaza; la anterior propia sí se borra; todo bajo `products/{companyId}/`.
- `test_upload_cannot_delete_another_companys_product_image` — empresa A con `image_url` crafteado al archivo de B → tras subir, el archivo y el `image_url` de B intactos.
- `test_manipulating_image_url_cannot_delete_foreign_or_arbitrary_files` — archivos plantados en `products/{B}/` y en la ruta plana `products/legacy-plano.jpg`; `image_url` crafteado a cada uno → ambos sobreviven, la imagen nueva cae en `products/{A}/`.
- **Verificado que 2 de los 3 fallan si se revierte el fix** (prefijo plano `products/` → el `image_url` crafteado borra el archivo ajeno).

### Permiso `clients.delete` — migración de backfill

**Problema:** `clients.delete` existía solo en el seeder. Un deploy que corre
`migrate` pero no `db:seed` (updates) no tendría el permiso → `DELETE /clients/{id}`
daría `403` también para admins.

**Fix:** [`2026_09_07_000004_add_clients_delete_permission.php`](../backend/database/migrations/2026_09_07_000004_add_clients_delete_permission.php)
— crea el permiso `clients.delete` (guard `web`) si no existe y lo concede a
`Super Admin` y `Administrador de empresa` (los roles que reciben "todos" los
permisos en el seeder). **Idempotente** (`exists()` + `updateOrInsert`), busta la
caché de Spatie. `Ventas` no está en la lista → no lo recibe. El seeder sigue
igual (idempotente); `migrate:fresh --seed` corre migración → seeder sin conflicto.

**Tests:**
- `ClientDeletionPermissionTest::test_backfill_migration_grants_clients_delete_to_admin_roles_only` — simula instalación existente (roles sembrados, permiso borrado), corre `->up()`, verifica que Super Admin y Administrador de empresa lo obtienen, Ventas no (y conserva `clients.manage`), y que reejecutar no duplica.
- `RolePermissionsTest::test_permissions_catalog_is_listable` — ajustado a aserción de contención (más robusto); ahora también verifica que `clients.delete` (backfilleado por la migración) aparece en el catálogo.
- Los 4 tests de `ClientDeletionPermissionTest` de la ronda 1 (Ventas 403, admin 204, FK 422) siguen verdes.

---

## Ronda 4 (2026-09-07) — `image_url` solo lo fija el servidor (AUD-11)

### Problema

`image_url` es contenido del catálogo (se renderiza en `/catalogo` y en la ficha
pública). Estaba en `Product::$fillable` y en `StoreProductRequest` como
`['nullable', 'url', 'max:500']`, así que un `POST/PUT/PATCH /api/products` podía
fijarlo a **cualquier URL externa arbitraria** (tracker, contenido de terceros,
`javascript:` no, pero sí `http(s)` a cualquier host) y esa URL terminaba
renderizada como `<img src>` en el catálogo público. La imagen debe ser dinámica
pero **gestionada por el backend**, no elegida libre por el cliente de la API.

### Fix (mínimo, solo cierra ese vector)

- [`Product`](../backend/app/Models/Product.php): `image_url` fuera de `$fillable`.
  No es asignable en masa por ningún `create`/`update`.
- [`StoreProductRequest`](../backend/app/Http/Requests/StoreProductRequest.php):
  se quitó la regla `image_url`. `BaseCrudController::validatedInput` solo
  propaga claves validadas → un `image_url` en el payload se descarta en alta,
  PUT y PATCH.
- [`ProductController::image`](../backend/app/Http/Controllers/Api/ProductController.php):
  `->forceFill(['image_url' => Storage::url($path)])->save()` — el único punto
  que escribe la columna, con la ruta que el servidor controla
  (`products/{companyId}/{random40}.{ext}`, extensión según el contenido real).
- [`/app/productos`](../frontend/src/app/app/productos/page.tsx): se quitó el
  campo de formulario "URL de imagen externa". La imagen se sube por la acción
  "Imagen" de la fila (`POST /products/{id}/image`); el resto del catálogo (grid,
  filtro de categorías, ficha) ya era 100 % data-driven y no se tocó.

El catálogo conserva su comportamiento dinámico: categorías, productos e imágenes
válidas siguen viniendo de la BD por la API. Regla escrita en
[`architecture.md`](architecture.md#el-catálogo-es-data-driven-regla-de-proyecto).

### Tests

- `InventoryCatalogTest::test_image_url_cannot_be_set_through_the_product_payload`
  — `image_url` externo en POST **y** en PUT **y** en PATCH → nunca se persiste
  ni se sirve (`data.0.image_url === null`).
- `InventoryCatalogTest::test_an_uploaded_image_is_served_dynamically_by_the_api`
  — una imagen subida por el endpoint sí aparece en `GET /products` con la ruta
  `/storage/products/{companyId}/…`.
- `PublicCatalogTest::test_categories_are_served_dynamically_from_the_database`
  — el filtro de categorías se deriva de la BD (solo categorías con producto
  público y activo); una categoría nueva con producto público aparece sin tocar
  el front.
- `ProductImageIsolationTest` (ronda 3) — ajustado: los productos con `image_url`
  "manipulado" se montan con `forceFill` (ya no es fillable). Los 3 tests de
  aislamiento entre empresas siguen verdes.
- Suite backend completa: **101 passed**.
