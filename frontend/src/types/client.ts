import type { PropertyTypeValue } from "@/types/property";

export interface ClientOption {
  id: number;
  name: string;
}

export const CLIENT_STATUSES = ["activo", "inactivo"] as const;
export type ClientStatusValue = (typeof CLIENT_STATUSES)[number];

export const CLIENT_STATUS_LABELS: Record<ClientStatusValue, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
};

export const INTEREST_TYPES = ["compra", "arriendo"] as const;
export type InterestTypeValue = (typeof INTEREST_TYPES)[number];

export const INTEREST_TYPE_LABELS: Record<InterestTypeValue, string> = {
  compra: "Compra",
  arriendo: "Arriendo",
};

export interface Client {
  id: number;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  interest_type: InterestTypeValue | null;
  budget_min: number | null;
  budget_max: number | null;
  interest_zones: string[];
  property_type_interest: PropertyTypeValue | null;
  bedrooms_needed: number | null;
  notes: string | null;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  status: ClientStatusValue;
  created_at: string;
  updated_at: string;
}
