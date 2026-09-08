import type { Metadata } from "next";
import { CtaLink } from "@/components/marketing/cta-link";
import { DocSectionList, DocSidebar } from "@/components/marketing/doc-sections";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section } from "@/components/marketing/marketing-ui";
import { userDocSections } from "@/components/marketing/marketing-data";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description:
    "Guias cortas para usar CRM + Inventario: primeros pasos, CRM, inventario, pedidos, compras y reportes.",
};

export default function CentroDeAyudaPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Centro de ayuda"
        title="Usa la plataforma sin complicaciones"
        lead="Encuentra guias cortas para realizar las tareas mas importantes de tu negocio."
      />

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <DocSidebar sections={userDocSections} />

          <div className="space-y-6">
            <DocSectionList sections={userDocSections} />

            <Reveal>
              <div className="rounded-2xl border border-border bg-secondary/40 p-7">
                <h2 className="text-xl font-bold">¿Necesitas integrar otro sistema?</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                  CRM + Inventario dispone de herramientas de integracion para conectar tiendas online, sistemas
                  contables y otras aplicaciones.
                </p>
                <div className="mt-5">
                  <CtaLink href="/documentacion/desarrolladores" variant="outline">
                    Ver documentacion para desarrolladores
                  </CtaLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  );
}
