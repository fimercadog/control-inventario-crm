import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { blogPostBySlug } from "@/components/marketing/marketing-data";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/marketing-ui";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) notFound();

  return (
    <MarketingLayout>
      <PageHero eyebrow={post.category} title={post.title} lead={post.excerpt} />

      <Section className="pt-0">
        <article className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <ArrowLeft className="size-4" /> Volver al blog
          </Link>
          <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground">
            <p>
              Este es contenido inicial de demostración para validar la estructura editorial del blog. Debe
              reemplazarse por un artículo real, escrito o revisado por el equipo veterinario, antes de publicarlo.
            </p>
            <p>
              El enfoque de cada artículo es práctico: orientar al propietario sobre una situación real de cuidado
              animal, con recomendaciones claras y, cuando aplica, la invitación a agendar una consulta.
            </p>
            <p>
              La versión final podrá incluir imágenes propias, autoría del veterinario, fecha, artículos
              relacionados y datos estructurados SEO.
            </p>
          </div>
        </article>
      </Section>
    </MarketingLayout>
  );
}
