# Roles Y Permisos

Roles seed:

- Super Admin
- Administrador de empresa
- Ventas
- Inventario
- Usuario

Permisos seed:

- `dashboard.view`
- `leads.view`
- `clients.manage`
- `deals.manage`
- `activities.manage`
- `products.manage`
- `warehouses.manage`
- `stock.manage`
- `suppliers.manage`
- `purchase_orders.manage`
- `orders.manage`
- `reports.view`
- `users.manage`
- `roles.manage`
- `audit.view`
- `settings.manage`

| Rol | Permisos |
| --- | --- |
| Super Admin / Administrador de empresa | Todos |
| Ventas | `dashboard.view`, `leads.view`, `clients.manage`, `deals.manage`, `activities.manage`, `orders.manage`, `reports.view` |
| Inventario | `dashboard.view`, `products.manage`, `warehouses.manage`, `stock.manage`, `suppliers.manage`, `purchase_orders.manage`, `orders.manage`, `reports.view` |
| Usuario | `dashboard.view` |

Ver usuarios demo en [docs/demo-users.md](demo-users.md).
