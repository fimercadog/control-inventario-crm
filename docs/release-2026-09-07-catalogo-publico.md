# Release — Catálogo público (2026-09-07)

Cierre de la rama `feature/catalogo-publico`. El sitio de marketing pasa de "solo
formularios de contacto" a **catálogo navegable → solicitar cotización → CRM**.

Roadmap: [roadmap-modulos.md](roadmap-modulos.md) · Plan de la feature en `.claude/plans/`.

---

## Alcance final

| Bloque | Qué hace |
| --- | --- |
| **Catálogo público** (`/catalogo`) | Grid de productos `is_public` + activos, filtro por categoría, búsqueda. Sin exponer costo ni existencia. Precios de lista visibles. |
| **Ficha de producto** (`/catalogo/[id]`) | Imagen, descripción, marca, unidad, precio, selector de cantidad → "Agregar a cotización". |
| **Solicitar cotización** (`/catalogo/cotizacion`) | Carrito local (`localStorage` vía `useSyncExternalStore`), tabla editable, formulario con consentimiento Ley 1581. |
| **Integración con CRM** | `POST /public/catalog/quote-requests` → `Client` (`firstOrCreate` por email, dentro de la transacción) + `Quote` `draft` con `source=catalog` y líneas snapshot. El vendedor la trabaja desde `/app/cotizaciones/[id]`. |
| **Imágenes de producto** | Acción "Imagen" por fila en `/app/productos` → sube a `storage/app/public/products/` (`POST /products/{id}/image`), miniatura en la tabla, se ve en el catálogo. El campo "URL externa" sigue disponible para CDN. |

### Endpoints nuevos

- `GET /public/catalog/products` · `GET /public/catalog/products/{id}` · `GET /public/catalog/categories` — sin auth, `throttle:catalog-read` (120/min).
- `POST /public/catalog/quote-requests` — sin auth, `throttle:catalog-quote` (5/min), consentimiento obligatorio.
- `POST /products/{id}/image` — `auth:sanctum` + `can:products.manage`.

### Esquema

- `products`: `+description` (text), `+image_url` (string 500), `+is_public` (bool, index).
- `quotes`: `+source` (`internal` | `catalog`).
- `clients`: `unique(company_id, email)` — un cliente por correo por empresa.

---

## Bugs encontrados y corregidos en el cierre

El E2E y `/code-review` (3 rondas) destaparon defectos **preexistentes**, no solo del feature:

1. **Rate-limit compartido** — `throttle:X,Y` dinámico se llavea por (dominio, IP), no por límite: navegar el catálogo (muchos GET) agotaba la cuota de "solicitar cotización" y devolvía **429** a un visitante real. Fix: limiters con nombre (`catalog-read` / `catalog-quote`) en `AppServiceProvider`.
2. **`BaseCrudController::validatedInput` en update** — usaba `new $class` sin contexto de request: **cualquier producto editado con `category_id`/`brand_id`/`unit_id` daba 422**, y editar el correo de un cliente daba 500. Fix: `FormRequest::createFrom($request, ...)` conserva los resolvers de usuario y ruta.
3. **CSRF en formularios públicos** — `/leads` y `/public/catalog/*` quedaban bajo el CSRF stateful de Sanctum (419 desde el navegador). Fix: exentos en `bootstrap/app.php` (la protección es el throttle por IP).
4. **Select booleano** ("visible en catálogo") mandaba `"true"/"false"`, que la regla `boolean` rechaza. Fix: `"0"/"1"` + `fieldDefault` normaliza booleanos.
5. Borrado de imagen anterior: se hacía antes de guardar la nueva (imagen rota si falla) y sobre una ruta derivada de texto libre. Fix: guardar primero; borrar solo dentro de `products/` sin `..`.
6. Menores: `per_page=0` → 500; `items` sin `max`/`distinct`; búsqueda sin escapar `%`/`_`; "ver más" podía duplicar productos; carrito no validaba forma de los ítems.

---

## Verificación

| Gate | Resultado |
| --- | --- |
| `php artisan test` (SQLite) | **78 passed, 278 assertions** |
| `php artisan test` (MariaDB 10.4) | **78 passed** |
| `npm run lint` | limpio (1 warning preexistente en `data-table.tsx`) |
| `npm run build` | ✅ |
| E2E Playwright (`e2e/catalogo_publico.py`) | ✅ flujo público completo + verificación en el CRM (cotización con badge "Sitio web", líneas, cliente) + render de `/app/productos`. Capturas en `e2e/artifacts/`. |

---

## Deuda / pendientes para el gate de venta-despliegue

- **Migración `unique(company_id, email)`**: en una instalación existente con correos de cliente duplicados, `migrate` aborta a media tanda. Instalaciones nuevas (`migrate:fresh`) no se ven afectadas. Deduplicar antes de desplegar sobre datos reales.
- **`php artisan storage:link`** es parte del deploy (en hosting compartido, una vez). `APP_URL` debe ser el dominio real del backend para que las URLs de imagen resuelvan.
- GD no está en el PHP 8.4 local → `UploadedFile::fake()->image()` no se usa en tests (se usa `->create()` con mime). En el servidor de producción hace falta GD/Imagick para que Laravel valide imágenes reales por contenido.
- El rate-limit compartido por (dominio, IP) sigue afectando a `/leads` y `/auth/*` entre sí (bajo impacto; el catálogo era el único caso roto de verdad).
