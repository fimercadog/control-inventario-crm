import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section, cardHover } from "@/components/marketing/marketing-ui";
import { blogPosts } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

const categories = ["Operacion", "CRM", "Inventario", "Compras", "Reportes", "IA"];

export default function BlogPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Blog"
        title="Ideas practicas para vender y controlar inventario mejor"
        lead="Articulos demo iniciales, listos para reemplazar por contenido editorial real."
      />

      <Section className="pt-0">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <span key={c} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.04}>
              <Link
                href={`/blog/${post.slug}`}
                className={cn("flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{post.category}</p>
                <h2 className="mt-4 text-lg font-bold leading-snug">{post.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Leer articulo <ArrowRight className="size-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </MarketingLayout>
  );
}
