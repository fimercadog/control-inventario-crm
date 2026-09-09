import type { Metadata } from "next";
import { DocSectionList, DocSidebar } from "@/components/marketing/doc-sections";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/marketing-ui";
import { userDocSections } from "@/components/marketing/marketing-data";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description:
    "Guias cortas para usar VetPanel: primeros pasos, propietarios y pacientes, historia clínica, agenda, vacunas, inventario y reportes.",
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
          </div>
        </div>
      </Section>
    </MarketingLayout>
  );
}
