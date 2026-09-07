/**
 * URL pública del sitio (para metadata, sitemap y robots). Se define con
 * NEXT_PUBLIC_SITE_URL en cada despliegue (demo, producción). Sin la variable
 * cae a localhost — nunca a un dominio hardcodeado de otro proyecto.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "CRM + Inventario";
