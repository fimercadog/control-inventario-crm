import type { StatusConfig } from "@/components/shared/status-badge";
import { VISIT_STATUS_LABELS, type VisitStatusValue } from "@/types/visit";

export const VISIT_STATUS_CONFIG: Record<VisitStatusValue, StatusConfig> = {
  pendiente: { label: VISIT_STATUS_LABELS.pendiente, tone: "outline" },
  confirmada: { label: VISIT_STATUS_LABELS.confirmada, tone: "default" },
  realizada: { label: VISIT_STATUS_LABELS.realizada, tone: "success" },
  cancelada: { label: VISIT_STATUS_LABELS.cancelada, tone: "destructive" },
  reprogramada: { label: VISIT_STATUS_LABELS.reprogramada, tone: "warning" },
  no_asistio: { label: VISIT_STATUS_LABELS.no_asistio, tone: "destructive" },
};
