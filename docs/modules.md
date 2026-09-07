# Modulos

Implementados con base API y UI:

- Dashboard
- Clientes
- Deals (pipeline de ventas)
- Actividades (seguimiento comercial)
- Pedidos (venta a cliente; al confirmarse descuenta stock)
- Productos
- Bodegas
- Movimientos de inventario
- Proveedores
- Ordenes de compra (al recibirse suman stock)
- Leads (formulario publico de contacto/demo)
- Catalogo publico (sitio de marketing): catalogo navegable, ficha de producto y "Solicitar cotizacion" (carrito local) que entra al CRM como Cliente + Cotizacion en borrador (`source=catalog`). Subida de imagen de producto desde el panel (disco `public`).
- Auditoria
- Usuarios y roles
- Reportes

Pendientes:

- Modo contingencia (offline) para modulos de CRM/Inventario: la infraestructura sigue activa pero sin ningun modulo elegible todavia
- Formularios complejos con Dialog/AlertDialog y validacion visual completa
