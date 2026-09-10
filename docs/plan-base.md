# Plan base ($199.900/mes) — qué se oculta y por qué

Versión comercial de entrada. Se activa con la variable de entorno del frontend:

```
NEXT_PUBLIC_PLAN=base
```

Sin la variable, el sistema se ve **completo** (demo / plan full, lo que usa el
dueño). Es solo build del frontend — no hay migración ni cambio de datos.

**En el repo:** vive en la rama `plan/base`, que trae
`frontend/.env.production` (forzado al índice, `git add -f`) con
`NEXT_PUBLIC_PLAN=base`. `master` es la demo y **no** tiene ese archivo. Para un
cliente del plan de entrada se despliega la rama `plan/base` (mismo patrón que
`vertical/veterinaria`). Rebasar `plan/base` sobre `master` cuando master avance.

> **Default del producto:** la **demo comercial** de Control de Inventario + CRM
> y cualquier cliente que compró el sistema completo corren **sin**
> `NEXT_PUBLIC_PLAN`. `=base` se pone únicamente en el despliegue de un cliente
> que contrató el plan de entrada. `plan.ts` y esta infraestructura se conservan
> para futuros planes / add-ons.

## Criterio

Se deja visible todo lo que permite **hacer** el proceso comercial base:

> Web → Lead → Cliente → Cotización → Pedido → Inventario

Se oculta lo que **mejora, amplía, automatiza o controla** ese proceso pero no
impide ejecutarlo. Así el plan base "no parece una demo recortada": es un sistema
chico pero completo y usable.

## Qué queda visible

```
Dashboard

CRM
├── Leads          (los formularios web alimentan esta función — NO se oculta)
├── Clientes
├── Cotizaciones
└── Pedidos

Inventario
├── Productos
├── Categorías
├── Marcas
├── Unidades
├── Bodegas        (funcional; se podría limitar a 1 bodega — pendiente)
├── Movimientos
└── Proveedores

Herramientas
├── Modo contingencia   → botón "Premium" bloqueado (no oculto: gancho de venta)
└── Asistente IA        → botón "Premium" bloqueado (ya era así en el plan full)

Administración
├── Usuarios
└── Configuración
```

## Qué se oculta

| Módulo | Ruta | Add-on donde se vende |
| --- | --- | --- |
| Contactos | `/app/contactos` | CRM Pro |
| Segmentos | `/app/segmentos` | CRM Pro |
| Notas | `/app/notas` | CRM Pro |
| Deals | `/app/deals` | CRM Pro |
| Actividades | `/app/actividades` | CRM Pro |
| Tareas | `/app/tareas` | CRM Pro |
| Seguimientos | `/app/seguimientos` | CRM Pro |
| Calendario | `/app/calendario` | CRM Pro |
| Transferencias | `/app/transferencias` | Inventario Pro |
| Alertas de stock | `/app/alertas-stock` | Inventario Pro |
| Órdenes de compra | `/app/ordenes-compra` | Inventario Pro |
| Reportes | `/app/reportes` | Analítica |
| Reportes comerciales | `/app/reportes-comerciales` | Analítica |
| Auditoría | `/app/auditoria` | Premium |
| Roles | `/app/roles` | Premium |

**Modo contingencia** (`/app/contingencia`) no se oculta: se muestra como botón
Premium bloqueado con un modal explicativo, igual que Asistente IA.

### Efecto del ocultamiento

- **Menú lateral:** los ítems no aparecen. Los grupos que quedan vacíos
  (Analítica) desaparecen solos.
- **Por URL:** si alguien escribe la ruta a mano, ve "No tienes acceso a esta
  sección" (mismo guard que el de permisos).
- **Dashboard:** se ocultan las tarjetas y gráficos de esos módulos:
  - KPIs: *Deals abiertos*, *Deals ganados (mes)*, *Órdenes de compra pendientes*.
  - Sección *Pipeline por etapa* (deals).
  - Gráficos *Deals por etapa*, *Embudo de ventas*, *Deals ganados vs perdidos*.
  - Bloque *Actividad reciente* (auditoría).
  - Bloque *Productos con stock bajo* (alertas de stock).
  - Quedan: *Ingresos del mes*, *Clientes*, gráfico de *Ingresos* y
    *Top productos por existencia*.

## Límite conocido

El gate es **solo frontend**. Los endpoints de la API siguen respondiendo: un
usuario con token válido puede llegar a esos datos por fuera de la interfaz. Para
cerrarlo de verdad hace falta un middleware de plan en el backend (Laravel) que
devuelva 403 en las rutas de módulos no incluidos. Pendiente / a decidir según
el modelo de venta (¿plan por despliegue o por empresa en BD?).

## Dónde está en el código

- `frontend/src/lib/plan.ts` — `isBasePlan()`, `BASE_PLAN_HIDDEN`,
  `BASE_PLAN_PREMIUM` y los helpers `planHidesRoute` / `planLocksAsPremium`.
- `frontend/src/components/layout/admin-shell.tsx` — filtra el menú, guard por
  ruta, y renderiza contingencia como botón Premium (`PREMIUM_INFO`).
- `frontend/src/app/app/dashboard/page.tsx` — oculta tarjetas y gráficos
  (`const base = isBasePlan()`).
- `frontend/.env.example` — documentación de la variable.

**Vender un add-on** a un cliente: sacar sus rutas de `BASE_PLAN_HIDDEN` en
`plan.ts` y redesplegar su frontend.
