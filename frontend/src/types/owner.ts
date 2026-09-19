export const OWNER_STATUSES = ["activo", "inactivo"] as const;
export type OwnerStatusValue = (typeof OWNER_STATUSES)[number];

export const OWNER_STATUS_LABELS: Record<OwnerStatusValue, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
};

export interface Owner {
  id: number;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: OwnerStatusValue;
  properties_count: number;
  created_at: string;
  updated_at: string;
}

export interface OwnerOption {
  id: number;
  name: string;
}

export interface OwnerFormValues {
  name: string;
  document?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: OwnerStatusValue;
}
