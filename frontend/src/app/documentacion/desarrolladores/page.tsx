import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { DocSectionList, DocSidebar } from "@/components/marketing/doc-sections";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section } from "@/components/marketing/marketing-ui";
import { devDocSections } from "@/components/marketing/marketing-data";

export const metadata: Metadata = {
  title: "Para desarrolladores",
  description:
    "Documentacion de la API REST de CRM + Inventario para conectar tiendas online, sistemas contables y otras aplicaciones.",
};

export default function DesarrolladoresPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Para desarrolladores"
        title="Integra CRM + Inventario con otros sistemas mediante nuestra API"
        lead="Documentacion tecnica de la API REST: autenticacion, endpoints, webhooks y ejemplos para conectar tiendas online, sistemas contables y otras aplicaciones."
      />

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <DocSidebar sections={devDocSections} />

          <div className="space-y-6">
            <Link
              href="/documentacion"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Volver al centro de ayuda
            </Link>

            <DocSectionList sections={devDocSections} />

            <Reveal>
              <div className="rounded-2xl bg-ink p-7 text-ink-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Referencia tecnica</p>
                <h2 className="mt-3 text-xl font-bold">API REST sobre Laravel + Sanctum</h2>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  La plataforma expone una API REST autenticada con Sanctum. Recursos por modulo:{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/leads</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/clientes</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/productos</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/pedidos</code> y{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/ordenes-compra</code>.
                </p>
                <div className="mt-6">
                  <CtaLink href="/contacto">Pedir acceso a la documentacion completa</CtaLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  );
}
