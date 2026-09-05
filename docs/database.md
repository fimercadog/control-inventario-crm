# Base De Datos

SQLite es la persistencia inicial. Las migraciones evitan logica especifica de SQLite para facilitar migracion posterior a MySQL.

Tablas CRM + Inventario implementadas:

- `companies` (tenant)
- `leads`
- `clients`
- `deals`
- `activities`
- `products`
- `warehouses`
- `suppliers`
- `purchase_orders` / `purchase_order_items`
- `stock_movements`
- `orders` / `order_items` (puente CRM-Inventario: al confirmarse un pedido genera `stock_movements` tipo `out`; al recibirse una orden de compra genera tipo `in`)
- `audit_logs`
- `users`
- tablas de Sanctum
- tablas de Spatie Permissions

El stock disponible por producto+bodega se calcula como `SUM(quantity)` sobre `stock_movements` — no existe una tabla `stock` denormalizada.
