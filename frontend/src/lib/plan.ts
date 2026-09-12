// Plan comercial de este despliegue.
//
// Esta es la rama `low-ticket`: variante mínima para negocios chicos. Solo
// resuelve el flujo Cliente -> Cotización -> Pedido -> Inventario básico.
// Todo lo demás del sistema completo sigue en el código (nada se borra), pero
// se oculta del menú y bloquea por URL. Ver docs/low-ticket.md.
//
//   NEXT_PUBLIC_PLAN sin definir / "low_ticket"  -> plan low ticket (default de esta rama).
//   NEXT_PUBLIC_PLAN=full                         -> sistema completo (para previsualizar).
//
// En `master` esto no existe (default = completo). En `plan/base` es un
// escalón intermedio (mismo mecanismo, set de rutas ocultas más chico).

/** Escalones comerciales. Solo `low_ticket` y `premium` (= todo) se usan hoy;
 *  `basic`/`pro` quedan tipados para cuando se venda por módulos (FASE 7). */
export type PlanTier = "low_ticket" | "basic" | "pro" | "premium";

export const currentPlan = (): PlanTier =>
  process.env.NEXT_PUBLIC_PLAN === "full" ? "premium" : "low_ticket";

export const isLowTicket = () => currentPlan() === "low_ticket";

/** Rutas fuera del plan low ticket: ausentes del menú y bloqueadas si se escribe la URL. */
export const LOW_TICKET_HIDDEN = new Set<string>([
  // CRM -> PRO (seguimiento comercial)
  "/app/leads",
  "/app/contactos",
  "/app/segmentos",
  "/app/notas",
  "/app/deals",
  "/app/actividades",
  "/app/tareas",
  "/app/seguimientos",
  "/app/calendario",
  // Inventario / compras -> PRO
  "/app/marcas",
  "/app/unidades",
  "/app/bodegas",
  "/app/proveedores",
  "/app/transferencias",
  "/app/alertas-stock",
  "/app/ordenes-compra",
  // Analítica -> PRO
  "/app/reportes",
  "/app/reportes-comerciales",
  // Herramientas y administración avanzada -> PREMIUM
  "/app/ia",
  "/app/auditoria",
  "/app/roles",
  "/app/usuarios",
]);

export const planHidesRoute = (href?: string) => isLowTicket() && !!href && LOW_TICKET_HIDDEN.has(href);

/** No se ocultan: se muestran como botón "Premium" bloqueado (gancho de venta),
 *  mismo tratamiento que `plan/base` (ver admin-shell.tsx: PREMIUM_INFO). */
export const LOW_TICKET_LOCKED = new Set<string>(["/app/contingencia"]);

export const planLocksAsPremium = (href?: string) => isLowTicket() && !!href && LOW_TICKET_LOCKED.has(href);
