import { Check } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { ContactChannels, PlataformaGrid, Section } from "@/components/marketing/marketing-ui";

const included = [
  "Recorrido por CRM, inventario, pedidos y compras",
  "El puente CRM-inventario: confirmar un pedido descuenta stock",
  "Reportes y exportaciones CSV / PDF",
  "Roles, permisos y auditoria",
  "Como se veria con tus productos y bodegas",
];

export default function DemoPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Demo comercial"
        title="Mira tu operacion comercial y de inventario en una sola plataforma"
        lead="Resolvemos stock que no cuadra, pedidos manuales, leads dispersos, compras sin control y reportes armados a mano."
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
