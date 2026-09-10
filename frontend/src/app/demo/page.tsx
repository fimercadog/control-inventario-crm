import { Check } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { ContactChannels, PlataformaGrid, Section } from "@/components/marketing/marketing-ui";

const included = [
  "Recorrido por propietarios, pacientes, agenda e historia clínica",
  "Vacunas y desparasitación: aplicar un producto descuenta stock de farmacia",
  "Receta imprimible en PDF y reportes clínicos del período",
  "Roles de veterinario y recepción, permisos y auditoría",
  "Cómo se vería con tus servicios, profesionales y consultorios",
];

export default function DemoPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Demo guiada"
        title="Mira toda la operación de tu clínica en una sola plataforma"
        lead="Resolvemos la agenda en papel, historias clínicas dispersas, vacunas sin recordatorio, stock de farmacia que no cuadra y reportes armados a mano."
        actions={<ContactChannels />}
      />

      <Section>
        <PlataformaGrid />
      </Section>

      <Section className="bg-secondary/40">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <h2 className="text-2xl font-black tracking-tight">Que incluye la demo</h2>
            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm demo />
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
