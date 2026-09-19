export const VISIT_STATUSES = [
  "pendiente",
  "confirmada",
  "realizada",
  "cancelada",
  "reprogramada",
  "no_asistio",
] as const;
export type VisitStatusValue = (typeof VISIT_STATUSES)[number];

export const VISIT_STATUS_LABELS: Record<VisitStatusValue, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
  no_asistio: "No asistió",
};

export interface Visit {
  id: number;
  property: { id: number; code: string; title: string } | null;
  property_id: number;
  client: { id: number; name: string } | null;
  client_id: number;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  scheduled_at: string;
  status: VisitStatusValue;
  notes: string | null;
  result: string | null;
  follow_up: string | null;
  created_at: string;
  updated_at: string;
}
