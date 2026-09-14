import type { MetadataRoute } from "next";
import { blogPosts, services, team } from "@/components/marketing/marketing-data";
import { SITE_URL } from "@/lib/site";

const baseUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/servicios",
    "/equipo",
    "/urgencias",
    "/preguntas-frecuentes",
    "/testimonios",
    "/solicitar-cita",
    "/nosotros",
    "/blog",
    "/contacto",
    "/privacidad",
    "/terminos",
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })),
    ...services.map((s) => ({ url: `${baseUrl}/servicios/${s.slug}`, lastModified: new Date() })),
    ...team.map((t) => ({ url: `${baseUrl}/equipo/${t.slug}`, lastModified: new Date() })),
    ...blogPosts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date() })),
  ];
}
