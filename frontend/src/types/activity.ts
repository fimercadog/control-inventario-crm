export const ACTIVITY_TYPES = ["llamada", "whatsapp", "correo", "reunion", "nota", "seguimiento"] as const;
export type ActivityTypeValue = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityTypeValue, string> = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  correo: "Correo",
  reunion: "Reunión",
  nota: "Nota",
  seguimiento: "Seguimiento",
};

export interface Activity {
  id: number;
  type: ActivityTypeValue;
  notes: string;
  occurred_at: string;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  subject_type: string | null;
  subject_id: number | null;
  created_at: string;
  updated_at: string;
}
