// Plan comercial de este despliegue.
//
// Esta es la rama `plan/base`: el plan de entrada ($199.900) es el DEFAULT.
// Se ocultan los módulos que "mejoran / amplían / automatizan / controlan" el
// proceso, dejando el flujo base completo:
//   Web -> Lead -> Cliente -> Cotización -> Pedido -> Inventario.
//
//   NEXT_PUBLIC_PLAN sin definir / "base"  -> plan base (default de esta rama).
//   NEXT_PUBLIC_PLAN=full                   -> sistema completo (para previsualizar).
//
// En `master` esto se invierte (default = completo). Vender un add-on = sacar
// sus rutas de BASE_PLAN_HIDDEN y redesplegar. Ver docs/plan-base.md.

export const isBasePlan = () => process.env.NEXT_PUBLIC_PLAN !== "full";

/** Rutas fuera del plan base: ausentes del menú y bloqueadas si se escribe la URL. */
export const BASE_PLAN_HIDDEN = new Set<string>([
  // CRM Pro
  "/app/contactos",
  "/app/segmentos",
  "/app/notas",
  "/app/deals",
  "/app/actividades",
  "/app/tareas",
  "/app/seguimientos",
  "/app/calendario",
  // Inventario Pro
  "/app/transferencias",
  "/app/alertas-stock",
  "/app/ordenes-compra",
  // Analítica
  "/app/reportes",
  "/app/reportes-comerciales",
  // Premium / administración avanzada
  "/app/auditoria",
  "/app/roles",
]);

/** No se ocultan: se muestran como botón "Premium" bloqueado (gancho de venta). */
export const BASE_PLAN_PREMIUM = new Set<string>(["/app/contingencia"]);

export const planHidesRoute = (href?: string) =>
  isBasePlan() && !!href && BASE_PLAN_HIDDEN.has(href);

export const planLocksAsPremium = (href?: string) =>
  isBasePlan() && !!href && BASE_PLAN_PREMIUM.has(href);
