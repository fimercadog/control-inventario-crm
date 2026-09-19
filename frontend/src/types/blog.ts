export const BLOG_POST_STATUSES = ["borrador", "publicado"] as const;
export type BlogPostStatusValue = (typeof BLOG_POST_STATUSES)[number];

export const BLOG_POST_STATUS_LABELS: Record<BlogPostStatusValue, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
};

export interface BlogPostAuthorRef {
  id: number;
  name: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: BlogPostAuthorRef | null;
  status: BlogPostStatusValue;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormValues {
  title: string;
  excerpt?: string;
  content: string;
  status: BlogPostStatusValue;
  published_at?: string | null;
  meta_title?: string;
  meta_description?: string;
}
