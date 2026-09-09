# API

Base URL local: `http://127.0.0.1:8001/api`

Endpoints:

- `GET /dashboard`
- `GET /reports`
- `GET|POST /leads`, `GET|PUT|DELETE /leads/{id}` — `POST /leads` es alta manual desde el panel (`can:leads.view`, `source=manual`); `PUT` acepta datos de contacto + `status`
- `POST /public/leads` — alta publica sin auth (formularios demo / contacto del sitio), throttle 5/min, exige `consent`
- Catalogo publico (sin auth, throttle):
  - `GET /public/catalog/products` (params `category_id`, `q`, `page`; solo productos `is_public` + `active`, sin costo ni existencia)
  - `GET /public/catalog/products/{id}`
  - `GET /public/catalog/categories` (categorias con al menos un producto publico)
  - Limiters con nombre: `catalog-read` (120/min) para lectura, `catalog-quote` (5/min) para el envio; exentos de CSRF
  - `POST /public/catalog/quote-requests` (`name`, `email`, `phone?`, `company_name?`, `message?`, `consent`, `items[] {product_id, quantity}`) -> crea Cliente (`firstOrCreate` por email) + `Quote` `draft` con `source=catalog` + Lead (`firstOrCreate` por email+`source=catalog`)
- `GET|POST /clients`, `GET|PUT|DELETE /clients/{id}`
- `GET|POST /deals`, `GET|PUT|DELETE /deals/{id}`
- `GET|POST /activities`, `GET|PUT|DELETE /activities/{id}`
- `GET|POST /products`, `GET|PUT|DELETE /products/{id}`
  - `image_url` es de solo lectura vía el payload de producto: no es fillable y `POST/PUT/PATCH /products` lo ignoran. Solo lo fija el servidor por el endpoint de imagen.
  - `POST /products/{id}/image` (multipart `image`: jpg/png/webp, ≤ 2 MB; guarda en `products/{companyId}/` del disco `public` con nombre generado por el servidor y setea `image_url`)
- `GET|POST /warehouses`, `GET|PUT|DELETE /warehouses/{id}`
- `GET|POST /suppliers`, `GET|PUT|DELETE /suppliers/{id}`
- `GET|POST /stock-movements` (solo alta, es una bitacora inmutable)
- `GET|POST /purchase-orders`, `GET|PUT|DELETE /purchase-orders/{id}`
  - `POST /purchase-orders/{id}/items`, `DELETE /purchase-orders/{id}/items/{item}`
  - `POST /purchase-orders/{id}/receive` (genera `stock_movements` tipo `in`)
- `GET|POST /orders`, `GET|PUT|DELETE /orders/{id}`
  - `POST /orders/{id}/items`, `DELETE /orders/{id}/items/{item}`
  - `POST /orders/{id}/confirm` (valida existencias y genera `stock_movements` tipo `out`)
- `GET /audit-logs`
- `GET|POST /users`, `PUT /users/{id}` (`can:users.manage`)
  - `company_id` **nunca** se toma del payload: en alta lo fija el servidor desde la empresa del usuario autenticado; en edición no se toca. `status` (`active|inactive`) y `role` (nombre de rol existente) sí se aceptan, validados.
  - Sin `password` en el alta -> el servidor genera uno temporal y lo devuelve en `temporary_password`.
- `GET|POST /roles`, `GET|PUT /roles/{id}`, `GET /permissions` (`can:roles.manage`)
- La empresa (tenant) del request se resuelve del usuario autenticado; para requests publicos o usuarios sin empresa se usa la unica empresa de la instalacion. Si no hay ninguna empresa configurada (falta el seeder) -> `500`.
- `GET /exports/{resource}.csv`, `GET /exports/{resource}.pdf` (`clients`, `deals`, `products`, `suppliers`, `stock-movements`, `purchase-orders`, `orders`, `audit-logs`)

Parametros tabulares soportados:

- `page`, `per_page`, `search`, `sort`, `direction`, `status`, `date_from`, `date_to`

Los endpoints CRUD comparten paginacion backend. Las exportaciones respetan filtros razonables y exportan hasta 5000 filas.
