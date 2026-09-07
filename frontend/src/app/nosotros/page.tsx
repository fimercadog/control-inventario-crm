import { ArrowLeftRight, Boxes, Eye } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { DemoCta, FeatureCard, Section, SectionHeading } from "@/components/marketing/marketing-ui";

const pillars = [
  { icon: ArrowLeftRight, title: "Conectar ventas e inventario", text: "El pedido de venta descuenta stock y la orden de compra lo repone, sin cuadrar nada a mano." },
  { icon: Boxes, title: "Automatizar lo repetitivo", text: "Menos planillas, menos conteos manuales, menos correos para aprobar cosas." },
  { icon: Eye, title: "Dar visibilidad al negocio", text: "Reportes claros de ventas, pipeline y rotacion para decidir con datos, no con intuicion." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Nosotros"
        title="Tecnologia accesible para vender y controlar inventario sin caos"
        lead="Nace para que pequenas y medianas empresas conecten ventas e inventario sin depender de un ERP pesado, consultorias interminables o herramientas desconectadas."
        actions={<CtaLink href="/demo">Solicitar demo</CtaLink>}
      />

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Que nos mueve" title="Software claro, vendible y funcional" />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <FeatureCard icon={p.icon} title={p.title} text={p.text} />
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </MarketingLayout>
  );
}
