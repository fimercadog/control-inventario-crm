import * as React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

type StatusCategory = "success" | "warning" | "info" | "destructive" | "secondary";

function getStatusCategory(statusOrLabel?: string): StatusCategory {
  if (!statusOrLabel) return "secondary";
  const normalized = statusOrLabel.toLowerCase().trim();

  // Éxito / Pagado / Confirmado / Atendido / Activo
  if (
    normalized.includes("pagad") && !normalized.includes("parcial") ||
    normalized.includes("confirmad") ||
    normalized.includes("atendid") ||
    normalized.includes("aceptad") ||
    normalized.includes("recibid") ||
    normalized === "paid" ||
    normalized === "confirmed" ||
    normalized === "attended" ||
    normalized === "accepted" ||
    normalized === "received" ||
    normalized === "active" ||
    normalized === "activo" ||
    normalized === "activa" ||
    normalized === "open" ||
    normalized === "abierta" ||
    normalized === "won" ||
    normalized === "completad" ||
    normalized === "completed"
  ) {
    return "success";
  }

  // Advertencia / Parcial / Pendiente / Borrador / En revisión
  if (
    normalized.includes("parcial") ||
    normalized.includes("pendient") ||
    normalized.includes("borrador") ||
    normalized.includes("triage") ||
    normalized.includes("bajo") ||
    normalized.includes("no asistió") ||
    normalized === "pending" ||
    normalized === "partially_paid" ||
    normalized === "draft" ||
    normalized === "no-show" ||
    normalized === "qualification" ||
    normalized === "proposal" ||
    normalized === "negotiation"
  ) {
    return "warning";
  }

  // Informativo / Emitida / Programada / Enviada / Nuevo
  if (
    normalized.includes("emitid") ||
    normalized.includes("programad") ||
    normalized.includes("enviad") ||
    normalized.includes("nuev") ||
    normalized.includes("contactad") ||
    normalized === "issued" ||
    normalized === "scheduled" ||
    normalized === "sent" ||
    normalized === "new" ||
    normalized === "contacted" ||
    normalized === "prospecting" ||
    normalized === "internal" ||
    normalized === "interna" ||
    normalized === "sitio web"
  ) {
    return "info";
  }

  // Peligro / Anulada / Cancelada / Vencida / Inactiva / Rechazada
  if (
    normalized.includes("anulad") ||
    normalized.includes("cancelad") ||
    normalized.includes("vencid") ||
    normalized.includes("rechazad") ||
    normalized.includes("descartad") ||
    normalized.includes("agotad") ||
    normalized.includes("inactiv") ||
    normalized.includes("fallid") ||
    normalized.includes("glosad") ||
    normalized === "cancelled" ||
    normalized === "cancel" ||
    normalized === "rejected" ||
    normalized === "overdue" ||
    normalized === "inactive" ||
    normalized === "inactivo" ||
    normalized === "inactiva" ||
    normalized === "discarded" ||
    normalized === "failed" ||
    normalized === "lost" ||
    normalized === "closed" ||
    normalized === "cerrada"
  ) {
    return "destructive";
  }

  return "secondary";
}

export interface StatusBadgeProps extends BadgeProps {
  status?: string;
  label?: string;
}

export function StatusBadge({ status, label, className, variant, children, ...props }: StatusBadgeProps) {
  const text = label ?? (typeof children === "string" ? children : status ?? "");
  const category = variant ?? getStatusCategory(status ?? text);

  let categoryStyles = "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  if (category === "success") {
    categoryStyles = "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60";
  } else if (category === "warning") {
    categoryStyles = "bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60";
  } else if (category === "info" || category === "default") {
    categoryStyles = "bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60";
  } else if (category === "destructive") {
    categoryStyles = "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60";
  }

  return (
    <Badge className={`${categoryStyles} ${className ?? ""}`} {...props}>
      {children ?? text}
    </Badge>
  );
}
