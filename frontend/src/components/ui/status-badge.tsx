import * as React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

export type StatusCategory = "success" | "warning" | "info" | "destructive" | "secondary" | "purple";

export type StatusDefinition = {
  label: string;
  category: StatusCategory;
  className?: string;
};

/**
 * Diccionario maestro y estricto de estados técnicos del ERP Transversal.
 * Mapea cada clave técnica backend a su texto canonical en español, su categoría semántica de color y su variante de estilo CSS distintiva.
 */
export const STATUS_DICTIONARY: Record<string, StatusDefinition> = {
  // --- Ventas, Facturación & Cuentas ---
  draft: { label: "Borrador", category: "secondary", className: "bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" },
  issued: { label: "Emitida", category: "info", className: "bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800" },
  sent: { label: "Enviada", category: "info", className: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800" },
  pending: { label: "Pendiente", category: "warning", className: "bg-amber-100 text-amber-950 border-2 border-amber-400 font-semibold dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700" },
  partial: { label: "Parcial", category: "warning", className: "bg-yellow-200 text-yellow-950 border-2 border-yellow-500 font-bold dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600" },
  partially_paid: { label: "Parcialmente pagada", category: "warning", className: "bg-yellow-200 text-yellow-950 border-2 border-yellow-500 font-bold dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600" },
  paid: { label: "Pagada", category: "success", className: "bg-green-200 text-green-950 border-2 border-green-600 font-extrabold uppercase tracking-wider dark:bg-green-900 dark:text-green-100 dark:border-green-400" },
  accepted: { label: "Aceptada", category: "success", className: "bg-teal-100 text-teal-950 border border-teal-400 font-medium dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700" },
  confirmed: { label: "Confirmada", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800" },
  received: { label: "Recibida", category: "success", className: "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300" },
  converted: { label: "Convertida", category: "success", className: "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300" },
  void: { label: "Anulada", category: "destructive", className: "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300" },
  cancelled: { label: "Cancelada", category: "destructive", className: "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800" },
  cancel: { label: "Cancelada", category: "destructive", className: "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800" },
  rejected: { label: "Rechazada", category: "destructive", className: "bg-red-100 text-red-950 border border-red-400 font-bold dark:bg-red-950 dark:text-red-200 dark:border-red-800" },
  overdue: { label: "Vencida", category: "destructive", className: "bg-red-200 text-red-950 border-2 border-red-600 font-extrabold dark:bg-red-900 dark:text-red-100 dark:border-red-500" },

  // --- CRM, Leads & Oportunidades ---
  new: { label: "Nuevo", category: "info", className: "bg-sky-50 text-sky-900 border-2 border-sky-400 font-bold dark:bg-sky-950 dark:text-sky-200 dark:border-sky-500" },
  contacted: { label: "Contactado", category: "info", className: "bg-indigo-100 text-indigo-950 border-2 border-indigo-500 font-bold dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-400" },
  connected: { label: "Conectado", category: "info", className: "bg-indigo-100 text-indigo-950 border-2 border-indigo-500 font-bold dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-400" },
  prospecting: { label: "Prospección", category: "info", className: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800" },
  qualification: { label: "Calificación", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  proposal: { label: "Propuesta", category: "warning", className: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950 dark:text-orange-200" },
  negotiation: { label: "Negociación", category: "warning", className: "bg-yellow-100 text-yellow-900 border border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200" },
  won: { label: "Ganado", category: "success", className: "bg-green-200 text-green-950 border-2 border-green-600 font-extrabold uppercase dark:bg-green-950 dark:text-green-200" },
  lost: { label: "Perdido", category: "destructive", className: "bg-red-100 text-red-950 border border-red-400 font-bold dark:bg-red-950 dark:text-red-200" },

  // --- Citas, Agenda & Servicios ---
  scheduled: { label: "Programado", category: "info", className: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300" },
  in_progress: { label: "En proceso", category: "info", className: "bg-blue-100 text-blue-900 border border-blue-400 font-semibold dark:bg-blue-950 dark:text-blue-200" },
  completed: { label: "Completado", category: "success", className: "bg-lime-100 text-lime-950 border-2 border-lime-500 font-bold dark:bg-lime-950 dark:text-lime-200" },
  attended: { label: "Atendido", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" },
  no_show: { label: "No asistió", category: "warning", className: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950 dark:text-orange-200" },

  // --- Agencia de Viajes ---
  quoted: { label: "Cotizado", category: "warning", className: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950 dark:text-orange-200" },
  reserved: { label: "Reservado", category: "info", className: "bg-cyan-100 text-cyan-900 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200" },
  pending_payment: { label: "Pago pendiente", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  traveling: { label: "En viaje", category: "purple", className: "bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 dark:bg-fuchsia-950 dark:text-fuchsia-200" },
  expired: { label: "Expirada", category: "destructive", className: "bg-red-200 text-red-950 border-2 border-red-500 font-bold dark:bg-red-900 dark:text-red-100" },

  // --- Entidades Generales & Maestros ---
  active: { label: "Activo", category: "success", className: "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" },
  inactive: { label: "Inactivo", category: "secondary", className: "bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800" },
  open: { label: "Abierta", category: "success", className: "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300" },
  closed: { label: "Cerrada", category: "destructive", className: "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300" },
  deleted: { label: "Eliminado", category: "destructive", className: "bg-red-200 text-red-950 border-2 border-red-600 font-extrabold dark:bg-red-900 dark:text-red-100" },

  // --- Orígenes, Canales & Tags ---
  catalog: { label: "Sitio web", category: "info", className: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300" },
  web: { label: "Sitio web", category: "info", className: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300" },
  website: { label: "Sitio web", category: "info", className: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300" },
  internal: { label: "Interna", category: "secondary", className: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300" },
  manual: { label: "Manual", category: "secondary", className: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300" },
  contingency: { label: "Contingencia", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  ai: { label: "IA", category: "purple", className: "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-200" },
  automated: { label: "Automatizado", category: "purple", className: "bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300" },
  premium: { label: "Premium", category: "purple", className: "bg-violet-100 text-violet-900 border border-violet-400 font-bold dark:bg-violet-950 dark:text-violet-200" },

  // --- Inventario & Alertas ---
  in: { label: "Entrada", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" },
  out: { label: "Salida", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  COMPRA: { label: "Compra", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" },
  VENTA: { label: "Venta", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  AJUSTE_ENTRADA: { label: "Ajuste entrada", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" },
  AJUSTE_SALIDA: { label: "Ajuste salida", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  TRASLADO: { label: "Traslado", category: "info", className: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-200" },
  low: { label: "Bajo stock", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  low_stock: { label: "Bajo stock", category: "warning", className: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200" },
  out_of_stock: { label: "Agotado", category: "destructive", className: "bg-red-200 text-red-950 border border-red-500 font-bold dark:bg-red-900 dark:text-red-100" },
  overstock: { label: "Sobrestock", category: "info", className: "bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950 dark:text-sky-200" },

  // --- Contingencia & Cola Técnica ---
  synced: { label: "Sincronizado", category: "success", className: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" },
  failed: { label: "Con error", category: "destructive", className: "bg-red-100 text-red-900 border border-red-400 font-bold dark:bg-red-950 dark:text-red-200" },
  conflict: { label: "Conflicto", category: "destructive", className: "bg-rose-100 text-rose-900 border border-rose-400 font-bold dark:bg-rose-950 dark:text-rose-200" },
};

/**
 * Mapeo inteligente por texto secundario cuando el status técnico no viene explícito.
 */
export function getCategoryFromText(text: string): StatusCategory {
  const norm = text.toLowerCase().trim();

  // 1. Gris (Neutral / Borrador / Interno / Inactivo)
  if (
    norm.includes("borrador") ||
    norm.includes("intern") ||
    norm.includes("manual") ||
    norm.includes("sin dato")
  ) {
    return "secondary";
  }

  // 2. Verde (Éxito / Pagado / Confirmado / Aceptado / Activo / Ganado)
  if (
    (norm.includes("pagad") && !norm.includes("parcial")) ||
    norm.includes("aceptad") ||
    norm.includes("confirmad") ||
    norm.includes("atendid") ||
    norm.includes("recibid") ||
    norm.includes("ganad") ||
    norm.includes("completad") ||
    norm.includes("sincronizad") ||
    norm === "activo" ||
    norm === "activa" ||
    norm === "abierta" ||
    norm === "si" ||
    norm === "éxito" ||
    norm === "exito"
  ) {
    return "success";
  }

  // 3. Azul (Enviado / Emitido / Programado / Información / Sitio web)
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
    norm.includes("conectad") ||
    norm.includes("sobrestock")
  ) {
    return "info";
  }

  // 4. Ámbar / Amarillo (Pendiente / Parcial / Por revisar / Advertencia / Bajo stock)
  if (
    norm.includes("parcial") ||
    norm.includes("pendient") ||
    norm.includes("calificacion") ||
    norm.includes("calificación") ||
    norm.includes("propuesta") ||
    norm.includes("negociacion") ||
    norm.includes("negociación") ||
    norm.includes("no asistió") ||
    norm.includes("bajo") ||
    norm.includes("salida")
  ) {
    return "warning";
  }

  // 5. Rojo (Rechazado / Vencido / Cancelado / Error / Inactivo / Agotado)
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
    norm === "inactivo" ||
    norm === "inactiva" ||
    norm === "cerrada" ||
    norm === "no"
  ) {
    return "destructive";
  }

  // 6. Morado (Especial / IA / Premium)
  if (norm.includes("ia") || norm.includes("premium") || norm.includes("automatizad")) {
    return "purple";
  }

  return "secondary";
}

/**
 * Obtiene la configuración completa (label + categoría + className) de un estado técnico.
 */
export function getStatusBadgeConfig(statusKey?: string, customLabel?: string): StatusDefinition {
  if (statusKey && STATUS_DICTIONARY[statusKey]) {
    const def = STATUS_DICTIONARY[statusKey];
    return {
      label: customLabel ?? def.label,
      category: def.category,
      className: def.className,
    };
  }

  const text = customLabel ?? statusKey ?? "Desconocido";
  const category = getCategoryFromText(text);

  // Mapeo dinámico por texto para garantizar diferenciación visual incluso sin statusKey técnico explícito
  let dynamicClassName: string | undefined;
  const norm = text.toLowerCase().trim();

  if (norm.includes("nuevo")) {
    dynamicClassName = "bg-sky-50 text-sky-900 border-2 border-sky-400 font-bold dark:bg-sky-950 dark:text-sky-200 dark:border-sky-500";
  } else if (norm.includes("contactad") || norm.includes("conectad")) {
    dynamicClassName = "bg-indigo-100 text-indigo-950 border-2 border-indigo-500 font-bold dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-400";
  } else if (norm === "activo" || norm === "activa") {
    dynamicClassName = "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
  } else if (norm.includes("pagad")) {
    dynamicClassName = "bg-green-200 text-green-950 border-2 border-green-600 font-extrabold uppercase tracking-wider dark:bg-green-900 dark:text-green-100 dark:border-green-400";
  } else if (norm.includes("pendient")) {
    dynamicClassName = "bg-amber-100 text-amber-950 border-2 border-amber-400 font-semibold dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700";
  } else if (norm.includes("parcial")) {
    dynamicClassName = "bg-yellow-200 text-yellow-950 border-2 border-yellow-500 font-bold dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600";
  } else if (norm.includes("cancelad")) {
    dynamicClassName = "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800";
  } else if (norm.includes("eliminad")) {
    dynamicClassName = "bg-red-200 text-red-950 border-2 border-red-600 font-extrabold dark:bg-red-900 dark:text-red-100";
  }

  return {
    label: text,
    category,
    className: dynamicClassName,
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

  let categoryStyles = config.className;

  if (!categoryStyles) {
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
    } else {
      categoryStyles = "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  }

  return (
    <Badge className={`${categoryStyles} ${className ?? ""}`} {...props}>
      {displayText}
    </Badge>
  );
}
