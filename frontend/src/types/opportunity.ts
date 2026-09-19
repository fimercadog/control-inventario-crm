export const OPPORTUNITY_STAGES = [
  "nuevo",
  "contactado",
  "calificado",
  "propiedades_enviadas",
  "visita_agendada",
  "visita_realizada",
  "negociacion",
  "cierre_ganado",
  "cierre_perdido",
] as const;
export type OpportunityStageValue = (typeof OPPORTUNITY_STAGES)[number];

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStageValue, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  propiedades_enviadas: "Propiedades enviadas",
  visita_agendada: "Visita agendada",
  visita_realizada: "Visita realizada",
  negociacion: "Negociación",
  cierre_ganado: "Cierre ganado",
  cierre_perdido: "Cierre perdido",
};

export const OPPORTUNITY_STATUSES = ["abierta", "ganada", "perdida"] as const;
export type OpportunityStatusValue = (typeof OPPORTUNITY_STATUSES)[number];

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatusValue, string> = {
  abierta: "Abierta",
  ganada: "Ganada",
  perdida: "Perdida",
};

export interface Opportunity {
  id: number;
  client: { id: number; name: string } | null;
  client_id: number;
  property: { id: number; code: string; title: string } | null;
  property_id: number | null;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  owner: { id: number; name: string } | null;
  owner_id: number | null;
  value: number | null;
  stage: OpportunityStageValue;
  status: OpportunityStatusValue;
  closed_at: string | null;
  probability: number | null;
  next_action: string | null;
  estimated_close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
