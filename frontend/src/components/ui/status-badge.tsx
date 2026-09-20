import * as React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

export type StatusCategory = "success" | "warning" | "info" | "destructive" | "secondary" | "purple";

export type StatusDefinition = {
  label: string;
  category: StatusCategory;
};

/**
 * Diccionario maestro y estricto de estados técnicos del ERP Transversal.
 * Mapea cada clave técnica backend a su texto canonical en español y su categoría semántica de color.
 */
export const STATUS_DICTIONARY: Record<string, StatusDefinition> = {
  // --- Ventas, Facturación & Cuentas ---
  draft: { label: "Borrador", category: "secondary" },
  issued: { label: "Emitida", category: "info" },
  sent: { label: "Enviada", category: "info" },
  pending: { label: "Pendiente", category: "warning" },
  partial: { label: "Parcial", category: "warning" },
  partially_paid: { label: "Parcialmente pagada", category: "warning" },
  paid: { label: "Pagada", category: "success" },
  accepted: { label: "Aceptada", category: "success" },
  confirmed: { label: "Confirmada", category: "success" },
  received: { label: "Recibida", category: "success" },
  converted: { label: "Convertida", category: "success" },
  void: { label: "Anulada", category: "destructive" },
  cancelled: { label: "Cancelada", category: "destructive" },
  cancel: { label: "Cancelada", category: "destructive" },
  rejected: { label: "Rechazada", category: "destructive" },
  overdue: { label: "Vencida", category: "destructive" },

  // --- Citas, Asistencia & Salud ---
  scheduled: { label: "Programada", category: "info" },
  attended: { label: "Atendida", category: "success" },
  "no-show": { label: "No asistió", category: "warning" },
  triage: { label: "Triage", category: "warning" },
  in_consultation: { label: "En atención", category: "info" },
  discharged: { label: "Egresado", category: "success" },
  auth_pending: { label: "Autorización pendiente", category: "warning" },

  // --- CareNote (IA & Transcripción Médica) ---
  session_open: { label: "Sesión abierta", category: "info" },
  transcribing: { label: "Transcribiendo", category: "purple" },
  ready: { label: "Nota lista", category: "success" },
  transcription_failed: { label: "Transcripción fallida", category: "destructive" },

  // --- CRM, Leads & Oportunidades ---
  new: { label: "Nuevo", category: "info" },
  contacted: { label: "Contactado", category: "info" },
  prospecting: { label: "Prospección", category: "info" },
  qualification: { label: "Calificación", category: "warning" },
  proposal: { label: "Propuesta", category: "warning" },
  negotiation: { label: "Negociación", category: "warning" },
  won: { label: "Ganado", category: "success" },
  lost: { label: "Perdido", category: "destructive" },
  discarded: { label: "Descartado", category: "destructive" },

  // --- Entidades Generales & Maestros ---
  active: { label: "Activo", category: "success" },
  inactive: { label: "Inactivo", category: "destructive" },
  open: { label: "Abierta", category: "success" },
  closed: { label: "Cerrada", category: "destructive" },

  // --- Orígenes, Canales & Tags ---
  catalog: { label: "Sitio web", category: "info" },
  web: { label: "Sitio web", category: "info" },
  website: { label: "Sitio web", category: "info" },
  internal: { label: "Interna", category: "secondary" },
  manual: { label: "Manual", category: "secondary" },
  contingency: { label: "Contingencia", category: "warning" },
  ai: { label: "IA", category: "purple" },
  automated: { label: "Automatizado", category: "purple" },
  premium: { label: "Premium", category: "purple" },

  // --- Inventario & Alertas ---
  in: { label: "Entrada", category: "success" },
  out: { label: "Salida", category: "warning" },
  COMPRA: { label: "Compra", category: "success" },
  VENTA: { label: "Venta", category: "warning" },
  AJUSTE_ENTRADA: { label: "Ajuste entrada", category: "success" },
  AJUSTE_SALIDA: { label: "Ajuste salida", category: "warning" },
  TRASLADO: { label: "Traslado", category: "info" },
  low: { label: "Bajo stock", category: "warning" },
  low_stock: { label: "Bajo stock", category: "warning" },
  out_of_stock: { label: "Agotado", category: "destructive" },
  overstock: { label: "Sobrestock", category: "info" },

  // --- Contingencia & Cola Técnica ---
  synced: { label: "Sincronizado", category: "success" },
  failed: { label: "Con error", category: "destructive" },
  conflict: { label: "Conflicto", category: "destructive" },
};

/**
 * Mapeo inteligente por texto secundario cuando el status técnico no viene explícito.
 */
export function getCategoryFromText(text: string): StatusCategory {
  const norm = text.toLowerCase().trim();

  // 1. Gris (Neutral / Borrador / Interno / Candidato)
  if (
    norm.includes("borrador") ||
    norm.includes("intern") ||
    norm.includes("manual") ||
    norm.includes("candidato") ||
    norm.includes("sin dato")
  ) {
    return "secondary";
  }

  // 2. Verde (Éxito / Pagado / Confirmado / Aceptado / Activo / Ganado / Disponible / Vacunado / Alta / Nota Lista)
  if (
    (norm.includes("pagad") && !norm.includes("parcial")) ||
    norm.includes("aceptad") ||
    norm.includes("confirmad") ||
    norm.includes("atendid") ||
    norm.includes("recibid") ||
    norm.includes("ganad") ||
    norm.includes("completad") ||
    norm.includes("sincronizad") ||
    norm.includes("disponible") ||
    norm.includes("vacunado") ||
    norm.includes("alta") ||
    norm.includes("contratado") ||
    norm.includes("nota lista") ||
    norm === "activo" ||
    norm === "activa" ||
    norm === "abierta" ||
    norm === "si" ||
    norm === "éxito" ||
    norm === "exito"
  ) {
    return "success";
  }

  // 3. Azul (Enviado / Emitido / Programado / Información / Sitio web / Atención / Arrendado / Sesión Abierta)
  if (
    norm.includes("enviad") ||
    norm.includes("emitid") ||
    norm.includes("programad") ||
    norm.includes("sitio web") ||
    norm.includes("prospeccion") ||
    norm.includes("prospección") ||
    norm.includes("traslado") ||
    norm.includes("nuevo") ||
    norm.includes("contactad") ||
    norm.includes("sobrestock") ||
    norm.includes("atención") ||
    norm.includes("atencion") ||
    norm.includes("arrendado") ||
    norm.includes("en selección") ||
    norm.includes("en seleccion") ||
    norm.includes("sesión abierta") ||
    norm.includes("sesion abierta")
  ) {
    return "info";
  }

  // 4. Ámbar / Amarillo (Pendiente / Parcial / Por revisar / Advertencia / Bajo stock / Reservado / Triage)
  if (
    norm.includes("parcial") ||
    norm.includes("pendient") ||
    norm.includes("triage") ||
    norm.includes("calificacion") ||
    norm.includes("calificación") ||
    norm.includes("propuesta") ||
    norm.includes("negociacion") ||
    norm.includes("negociación") ||
    norm.includes("no asistió") ||
    norm.includes("bajo") ||
    norm.includes("salida") ||
    norm.includes("reservado") ||
    norm.includes("valoración") ||
    norm.includes("valoracion") ||
    norm.includes("consentimiento")
  ) {
    return "warning";
  }

  // 5. Rojo (Rechazado / Vencido / Cancelado / Error / Inactivo / Agotado / Descartado)
  if (
    norm.includes("rechazad") ||
    norm.includes("vencid") ||
    norm.includes("cancelad") ||
    norm.includes("anulad") ||
    norm.includes("descartad") ||
    norm.includes("perdid") ||
    norm.includes("error") ||
    norm.includes("conflicto") ||
    norm.includes("agotad") ||
    norm.includes("fallida") ||
    norm === "inactivo" ||
    norm === "inactiva" ||
    norm === "cerrada" ||
    norm === "no"
  ) {
    return "destructive";
  }

  // 6. Morado (Especial / IA / Premium / Transcribiendo / Vendido)
  if (
    norm.includes("ia") ||
    norm.includes("premium") ||
    norm.includes("automatizad") ||
    norm.includes("transcribiendo") ||
    norm.includes("vendido")
  ) {
    return "purple";
  }

  return "secondary";
}

/**
 * Obtiene la configuración completa (label + categoría) de un estado técnico.
 */
export function getStatusBadgeConfig(statusKey?: string, customLabel?: string): StatusDefinition {
  if (statusKey && STATUS_DICTIONARY[statusKey]) {
    const def = STATUS_DICTIONARY[statusKey];
    return {
      label: customLabel ?? def.label,
      category: def.category,
    };
  }

  const text = customLabel ?? statusKey ?? "Desconocido";
  return {
    label: text,
    category: getCategoryFromText(text),
  };
}

export interface StatusBadgeProps extends BadgeProps {
  status?: string;
  label?: string;
}

export function StatusBadge({ status, label, className, variant, children, ...props }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(status, label ?? (typeof children === "string" ? children : undefined));
  const category = variant ?? config.category;
  const displayText = children ?? config.label;

  let categoryStyles = "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  if (category === "success") {
    categoryStyles = "bg-emerald-50 text-emerald-800 border border-emerald-300/60 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80";
  } else if (category === "info") {
    categoryStyles = "bg-sky-50 text-sky-800 border border-sky-300/60 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/80";
  } else if (category === "warning") {
    categoryStyles = "bg-amber-50 text-amber-900 border border-amber-300/60 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80";
  } else if (category === "destructive") {
    categoryStyles = "bg-rose-50 text-rose-800 border border-rose-300/60 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80";
  } else if (category === "purple") {
    categoryStyles = "bg-purple-50 text-purple-800 border border-purple-300/60 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/80";
  } else if (category === "secondary") {
    categoryStyles = "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }

  return (
    <Badge className={`${categoryStyles} ${className ?? ""}`} {...props}>
      {displayText}
    </Badge>
  );
}
