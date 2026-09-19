export const PROPERTY_TYPES = ["apartamento", "casa", "oficina", "local", "lote", "bodega", "finca", "otro"] as const;
export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ["venta", "arriendo"] as const;
export type ListingTypeValue = (typeof LISTING_TYPES)[number];

export const PROPERTY_STATUSES = ["borrador", "disponible", "reservado", "vendido", "arrendado", "inactivo"] as const;
export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number];

export interface PropertyOwnerRef {
  id: number;
  name: string;
}

export interface PropertyOption {
  id: number;
  code: string;
  title: string;
  owner_id: number | null;
}

export interface PropertyAgentRef {
  id: number;
  name: string;
}

export interface PropertyImage {
  id: number;
  url: string;
  alt: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface Property {
  id: number;
  code: string;
  slug: string;
  title: string;
  description: string | null;
  property_type: PropertyTypeValue;
  listing_type: ListingTypeValue;
  status: PropertyStatusValue;
  is_featured: boolean;
  owner: PropertyOwnerRef | null;
  agent: PropertyAgentRef | null;
  owner_id: number | null;
  agent_id: number | null;
  city: string;
  zone: string | null;
  address: string | null;
  price: number;
  admin_fee: number | null;
  stratum: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  built_area: number | null;
  private_area: number | null;
  year_built: number | null;
  features: string[];
  notes: string | null;
  published_at: string | null;
  images?: PropertyImage[];
  created_at: string;
  updated_at: string;
}

export interface PropertyFormValues {
  title: string;
  description?: string;
  property_type: PropertyTypeValue;
  listing_type: ListingTypeValue;
  status: PropertyStatusValue;
  is_featured?: boolean;
  owner_id?: number;
  agent_id?: number;
  city: string;
  zone?: string;
  address?: string;
  price: number;
  admin_fee?: number;
  stratum?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spots?: number;
  built_area?: number;
  private_area?: number;
  year_built?: number;
  notes?: string;
  published_at?: string | null;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  oficina: "Oficina",
  local: "Local",
  lote: "Lote",
  bodega: "Bodega",
  finca: "Finca",
  otro: "Otro",
};

export const LISTING_TYPE_LABELS: Record<ListingTypeValue, string> = {
  venta: "Venta",
  arriendo: "Arriendo",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatusValue, string> = {
  borrador: "Borrador",
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  arrendado: "Arrendado",
  inactivo: "Inactivo",
};
