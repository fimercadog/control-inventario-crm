// Plan comercial de este despliegue (vertical veterinaria).
//
//   NEXT_PUBLIC_PLAN vacío  -> plataforma completa.
//   NEXT_PUBLIC_PLAN=base   -> clínica chica de una sola sede: se ocultan los
//                              módulos que no aplican a ese caso. El código
//                              sigue ahí; una clínica más grande (cadena,
//                              convenios, criaderos, cuentas corporativas) los
//                              habilita quitando su ruta de BASE_PLAN_HIDDEN.
//
// Ver docs/roadmap-veterinaria.md (S1).

export const isBasePlan = () => process.env.NEXT_PUBLIC_PLAN === "base";

/** Rutas fuera del plan base: ausentes del menú y bloqueadas si se escribe la URL. */
export const BASE_PLAN_HIDDEN = new Set<string>([
  // Ciclo comercial B2B: una clínica chica no lo usa; una cadena con convenios sí.
  "/app/deals",
  "/app/reportes-comerciales",
  // Una sola sede: no hay transferencias entre bodegas.
  "/app/transferencias",
]);

/** No se ocultan: se muestran como botón "Premium" bloqueado (gancho de venta). */
export const BASE_PLAN_PREMIUM = new Set<string>(["/app/contingencia"]);

export const planHidesRoute = (href?: string) =>
  isBasePlan() && !!href && BASE_PLAN_HIDDEN.has(href);

export const planLocksAsPremium = (href?: string) =>
  isBasePlan() && !!href && BASE_PLAN_PREMIUM.has(href);
