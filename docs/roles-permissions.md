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
- `clients.delete` — borrado **permanente** de clientes (hard-delete). Separado de
  `clients.manage` a propósito: Ventas crea y edita clientes pero no los elimina.
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
| Super Admin / Administrador de empresa | Todos (incluye `clients.delete`) |
| Ventas | `dashboard.view`, `leads.view`, `clients.manage`, `deals.manage`, `activities.manage`, `orders.manage`, `reports.view` — **sin** `clients.delete` |
| Inventario | `dashboard.view`, `products.manage`, `warehouses.manage`, `stock.manage`, `suppliers.manage`, `purchase_orders.manage`, `orders.manage`, `reports.view` |
| Usuario | `dashboard.view` |

Borrado de clientes: `DELETE /api/clients/{id}` exige `clients.delete`. Sin
historial el cliente se elimina; con pedidos o cotizaciones asociadas la FK
RESTRICT responde `422` ("márcalo como inactivo") — ver
`BaseCrudController::destroy`.

Ver usuarios demo en [docs/demo-users.md](demo-users.md).
