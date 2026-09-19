import type { ListingTypeValue, PropertyTypeValue } from "@/types/property";

export interface PublicPropertySummary {
  id: number;
  slug: string;
  code: string;
  title: string;
  property_type: PropertyTypeValue;
  listing_type: ListingTypeValue;
  is_featured: boolean;
  city: string;
  zone: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  built_area: number | null;
  private_area: number | null;
  cover_image: string | null;
}

export interface PublicPropertyImage {
  id: number;
  url: string;
  alt: string | null;
  is_cover: boolean;
}

export interface PublicPropertyDetail {
  id: number;
  slug: string;
  code: string;
  title: string;
  description: string | null;
  property_type: PropertyTypeValue;
  listing_type: ListingTypeValue;
  is_featured: boolean;
  city: string;
  zone: string | null;
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
  agent: { name: string } | null;
  images: PublicPropertyImage[];
  published_at: string | null;
}

export interface PublicPropertyFilters {
  listing_type?: string;
  property_type?: string;
  city?: string;
  zone?: string;
  bedrooms?: string;
  bathrooms?: string;
  price_min?: string;
  price_max?: string;
}

export interface PublicBlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author: string | null;
  published_at: string | null;
}

export interface PublicBlogPostDetail extends PublicBlogPostSummary {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
}

export type LeadIntent = "compra_arriendo" | "vender_propiedad" | "contacto_general";

export interface PublicLeadPayload {
  name: string;
  email?: string;
  phone?: string;
  property_id?: number;
  message?: string;
  intent: LeadIntent;
  metadata?: Record<string, string | number | undefined>;
}
