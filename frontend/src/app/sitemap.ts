import type { MetadataRoute } from "next";
import { blogPosts } from "@/components/marketing/marketing-data";
import { SITE_URL } from "@/lib/site";

const baseUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/producto",
    "/producto/crm",
    "/producto/inventario",
    "/producto/pedidos",
    "/producto/compras",
    "/producto/reportes",
    "/producto/ia",
    "/precios",
    "/documentacion",
    "/nosotros",
    "/blog",
    "/contacto",
    "/demo",
    "/login",
    "/privacidad",
    "/terminos",
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })),
    ...blogPosts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date() })),
  ];
}
