import type { ApiSuccessResponse, PaginatedData } from "@/types/api";
import type {
  PublicBlogPostDetail,
  PublicBlogPostSummary,
  PublicLeadPayload,
  PublicPropertyDetail,
  PublicPropertyFilters,
  PublicPropertySummary,
} from "@/types/public";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Plain fetch (not the browser-only axios instance) so this module works
 * from Server Components and generateMetadata, not just the client.
 *
 * no-store, not a revalidate window: these pages are already force-dynamic
 * (never statically cached), and a property/listing can change status
 * (publicado, vendido, precio) from the CRM at any moment — a stale window
 * here means the public site disagrees with the CRM until it expires.
 */
async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status} ${path}`);
  }

  const body = (await response.json()) as ApiSuccessResponse<T>;
  return body.data;
}

export async function fetchPublicProperties(
  page: number,
  filters: PublicPropertyFilters = {},
  search?: string,
): Promise<PaginatedData<PublicPropertySummary>> {
  const params = new URLSearchParams({ page: String(page), per_page: "12" });
  if (search) params.set("search", search);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(`filter[${key}]`, value);
  }

  return publicFetch(`/public/properties?${params.toString()}`);
}

export async function fetchFeaturedProperties(): Promise<PublicPropertySummary[]> {
  return publicFetch("/public/properties/featured");
}

export async function fetchPublicPropertyBySlug(slug: string): Promise<PublicPropertyDetail | null> {
  try {
    return await publicFetch(`/public/properties/${slug}`);
  } catch {
    return null;
  }
}

export async function fetchPublicBlogPosts(page: number): Promise<PaginatedData<PublicBlogPostSummary>> {
  return publicFetch(`/public/blog?page=${page}`);
}

export async function fetchPublicBlogPostBySlug(slug: string): Promise<PublicBlogPostDetail | null> {
  try {
    return await publicFetch(`/public/blog/${slug}`);
  } catch {
    return null;
  }
}

export async function submitPublicLead(payload: PublicLeadPayload): Promise<void> {
  const response = await fetch(`${API_URL}/public/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "No fue posible enviar el formulario");
  }
}
