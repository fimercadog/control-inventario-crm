# Plan base ($199.900/mes) — qué se oculta y por qué

Versión comercial de entrada.

**En el repo:** vive en la rama `plan/base`. En esa rama, `isBasePlan()` en
`frontend/src/lib/plan.ts` devuelve `true` por **default** (base salvo que se
ponga `NEXT_PUBLIC_PLAN=full`). En `master` es al revés: default = sistema
completo, base solo con `NEXT_PUBLIC_PLAN=base`.

| Rama | Default | Para previsualizar el otro modo |
| --- | --- | --- |
| `master` (demo / sistema completo) | completo | `NEXT_PUBLIC_PLAN=base` |
| `plan/base` (cliente plan de entrada) | base | `NEXT_PUBLIC_PLAN=full` |

Para un cliente del plan de entrada se despliega la rama `plan/base` (mismo
patrón que `vertical/veterinaria`); funciona en dev y en prod sin tocar env.
Al rebasar `plan/base` sobre `master`, la única línea a conservar es la de
`isBasePlan()`. Es solo frontend — no hay migración ni cambio de datos.

## Criterio

Se deja visible todo lo que permite **hacer** el proceso comercial base:

> Web → Lead → Cliente → Cotización → Pedido → Inventario

Se oculta lo que **mejora, amplía, automatiza o controla** ese proceso pero no
impide ejecutarlo. Así el plan base "no parece una demo recortada": es un sistema
chico pero completo y usable.

## Qué queda visible

```text
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

- `frontend/src/lib/plan.ts` — `isBasePlan()` (default por rama), `BASE_PLAN_HIDDEN`,
  `BASE_PLAN_PREMIUM` y los helpers `planHidesRoute` / `planLocksAsPremium`.
- `frontend/src/components/layout/admin-shell.tsx` — filtra el menú, guard por
  ruta, y renderiza contingencia como botón Premium (`PREMIUM_INFO`).
- `frontend/src/app/app/dashboard/page.tsx` — oculta tarjetas y gráficos
  (`const base = isBasePlan()`).
- `frontend/.env.example` — documentación de la variable `NEXT_PUBLIC_PLAN`.

**Vender un add-on** a un cliente: sacar sus rutas de `BASE_PLAN_HIDDEN` en
`plan.ts` y redesplegar su frontend.
