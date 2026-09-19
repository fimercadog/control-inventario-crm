export const LEAD_SOURCES = [
  "web",
  "whatsapp",
  "llamada",
  "referido",
  "redes_sociales",
  "portal_inmobiliario",
  "manual",
  "otro",
] as const;
export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSourceValue, string> = {
  web: "Página web",
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  referido: "Referido",
  redes_sociales: "Redes sociales",
  portal_inmobiliario: "Portal inmobiliario",
  manual: "Manual",
  otro: "Otro",
};

export const LEAD_STATUSES = ["nuevo", "contactado", "calificado", "descartado", "convertido"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusValue, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  descartado: "Descartado",
  convertido: "Convertido",
};

export interface Lead {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSourceValue;
  status: LeadStatusValue;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  converted_to_client_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
