# API

Base URL local: `http://127.0.0.1:8001/api`

Endpoints:

- `GET /dashboard`
- `GET /reports`
- `GET|POST /leads`, `GET|PUT|DELETE /leads/{id}` (alta publica sin auth en `POST /leads`)
- Catalogo publico (sin auth, throttle):
  - `GET /public/catalog/products` (params `category_id`, `q`, `page`; solo productos `is_public` + `active`, sin costo ni existencia)
  - `GET /public/catalog/products/{id}`
  - `GET /public/catalog/categories` (categorias con al menos un producto publico)
  - `POST /public/catalog/quote-requests` (`name`, `email`, `phone?`, `company_name?`, `message?`, `consent`, `items[] {product_id, quantity}`) -> crea Cliente (`firstOrCreate` por email) + `Quote` `draft` con `source=catalog`
- `GET|POST /clients`, `GET|PUT|DELETE /clients/{id}`
- `GET|POST /deals`, `GET|PUT|DELETE /deals/{id}`
- `GET|POST /activities`, `GET|PUT|DELETE /activities/{id}`
- `GET|POST /products`, `GET|PUT|DELETE /products/{id}`
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
- `GET /exports/{resource}.csv`, `GET /exports/{resource}.pdf` (`clients`, `deals`, `products`, `suppliers`, `stock-movements`, `purchase-orders`, `orders`, `audit-logs`)

Parametros tabulares soportados:

- `page`, `per_page`, `search`, `sort`, `direction`, `status`, `date_from`, `date_to`

Los endpoints CRUD comparten paginacion backend. Las exportaciones respetan filtros razonables y exportan hasta 5000 filas.
