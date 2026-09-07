import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { blogPosts } from "@/components/marketing/marketing-data";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Blog
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary">{post.category}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-10 space-y-6 text-base leading-8 text-muted-foreground">
          <p>
            Este es contenido inicial ficticio creado para validar la estructura editorial del sitio. Debe
            reemplazarse por contenido final antes de una publicacion comercial.
          </p>
          <p>
            El enfoque del articulo es practico: explicar problemas reales de ventas e inventario, proponer pasos
            accionables y conectar cada tema con modulos concretos del producto.
          </p>
          <p>La version final podra incluir imagenes, autores, fechas, relacionados, newsletter y datos estructurados SEO.</p>
        </div>
      </article>
    </MarketingLayout>
  );
}
