"use client";

import * as React from "react";
import { CtaLink } from "@/components/marketing/cta-link";
import { ProductCard } from "@/components/marketing/product-card";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { fetchCatalog, type PublicProduct } from "@/lib/catalog";

const PREVIEW_COUNT = 3;

/**
 * Vitrina de catálogo en el inicio: trae los primeros productos públicos de la
 * API y enlaza a /catalogo. Es data-driven igual que el catálogo completo, pero
 * sin filtros ni buscador — solo un vistazo. Si la API no responde o no hay
 * productos públicos, la sección no se renderiza (nada roto en el home).
 */
export function CatalogPreview() {
  const [products, setProducts] = React.useState<PublicProduct[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetchCatalog({ page: 1 })
      .then((res) => {
        if (!cancelled) setProducts(res.data.slice(0, PREVIEW_COUNT));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || (products && products.length === 0)) return null;

  return (
    <Section className="bg-secondary/40">
      <SectionHeading
        eyebrow="Catálogo"
        title="Un vistazo a lo que puedes publicar"
        lead="El catálogo público es 100% dinámico: sale de la base de datos por la API. Agrega un producto o una imagen y aparece aquí sin tocar código."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products
          ? products.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06} className="h-full">
                <ProductCard product={product} showAdd={false} />
              </Reveal>
            ))
          : Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted/60" />
            ))}
      </div>

      <div className="mt-10 text-center">
        <CtaLink href="/catalogo" variant="outline">
          Ver catálogo completo
        </CtaLink>
      </div>
    </Section>
  );
}
