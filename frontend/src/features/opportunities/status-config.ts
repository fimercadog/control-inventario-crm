import type { StatusConfig } from "@/components/shared/status-badge";
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STATUS_LABELS, type OpportunityStageValue, type OpportunityStatusValue } from "@/types/opportunity";

export const OPPORTUNITY_STATUS_CONFIG: Record<OpportunityStatusValue, StatusConfig> = {
  abierta: { label: OPPORTUNITY_STATUS_LABELS.abierta, tone: "default" },
  ganada: { label: OPPORTUNITY_STATUS_LABELS.ganada, tone: "success" },
  perdida: { label: OPPORTUNITY_STATUS_LABELS.perdida, tone: "destructive" },
};

export const OPPORTUNITY_STAGE_CONFIG: Record<OpportunityStageValue, StatusConfig> = {
  nuevo: { label: OPPORTUNITY_STAGE_LABELS.nuevo, tone: "outline" },
  contactado: { label: OPPORTUNITY_STAGE_LABELS.contactado, tone: "outline" },
  calificado: { label: OPPORTUNITY_STAGE_LABELS.calificado, tone: "secondary" },
  propiedades_enviadas: { label: OPPORTUNITY_STAGE_LABELS.propiedades_enviadas, tone: "secondary" },
  visita_agendada: { label: OPPORTUNITY_STAGE_LABELS.visita_agendada, tone: "warning" },
  visita_realizada: { label: OPPORTUNITY_STAGE_LABELS.visita_realizada, tone: "warning" },
  negociacion: { label: OPPORTUNITY_STAGE_LABELS.negociacion, tone: "warning" },
  cierre_ganado: { label: OPPORTUNITY_STAGE_LABELS.cierre_ganado, tone: "success" },
  cierre_perdido: { label: OPPORTUNITY_STAGE_LABELS.cierre_perdido, tone: "destructive" },
};
