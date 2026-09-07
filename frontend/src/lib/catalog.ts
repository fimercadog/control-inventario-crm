import { api, PaginatedResponse } from "@/lib/api";

/** Vista publica de un producto (sin costo ni existencia). */
export type PublicProduct = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  unit_price: number;
  category: string | null;
  brand: string | null;
  unit: string | null;
};

export type CatalogCategory = { id: number; name: string };

export type QuoteRequestItem = { product_id: number; quantity: number };

export type QuoteRequestPayload = {
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  consent: boolean;
  items: QuoteRequestItem[];
};

export async function fetchCatalog(params: { category_id?: number; q?: string; page?: number }) {
  const { data } = await api.get<PaginatedResponse<PublicProduct>>("/public/catalog/products", {
    params: { ...params, per_page: 12 },
  });
  return data;
}

export async function fetchCatalogProduct(id: string | number) {
  const { data } = await api.get<{ data: PublicProduct }>(`/public/catalog/products/${id}`);
  return data.data;
}

export async function fetchCatalogCategories() {
  const { data } = await api.get<CatalogCategory[]>("/public/catalog/categories");
  return data;
}

export function submitQuoteRequest(payload: QuoteRequestPayload) {
  return api.post("/public/catalog/quote-requests", payload);
}

export const formatCOP = (value: number) => `$${Number(value).toLocaleString("es-CO")}`;
