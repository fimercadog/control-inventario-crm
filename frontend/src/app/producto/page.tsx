import { BarChart3, Boxes, Bot, ClipboardList, Handshake, Truck } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import {
  DemoCta,
  FeatureCard,
  ProblemGrid,
  Section,
  SectionHeading,
  TourGrid,
} from "@/components/marketing/marketing-ui";

const modules = [
  { icon: Handshake, title: "CRM", text: "Leads, clientes, deals y actividades de seguimiento en un solo pipeline.", href: "/producto/crm" },
  { icon: Boxes, title: "Inventario", text: "Productos, bodegas y la bitacora de cada movimiento de stock.", href: "/producto/inventario" },
  { icon: ClipboardList, title: "Pedidos de venta", text: "Al confirmarse descuentan stock de la bodega elegida.", href: "/producto/pedidos" },
  { icon: Truck, title: "Compras", text: "Proveedores y ordenes de compra que reponen inventario al recibirse.", href: "/producto/compras" },
  { icon: BarChart3, title: "Reportes", text: "Metricas de CRM e inventario con exportaciones CSV y PDF.", href: "/producto/reportes" },
  { icon: Bot, title: "Asistente de IA", text: "Capa conversacional para consultar stock, clientes y pedidos.", href: "/producto/ia" },
];

export default function ProductOverviewPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Producto"
        title="Software de CRM y control de inventario para PYMES"
        lead="Una plataforma SaaS que centraliza leads, clientes, deals, productos, bodegas, pedidos de venta, compras, reportes e IA, con el inventario y las ventas conectados."
        actions={
          <>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/precios" variant="outline">
              Ver precios
            </CtaLink>
          </>
        }
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Modulos conectados"
            title="CRM e inventario en una sola plataforma"
            lead="Cada modulo resuelve una parte concreta de la operacion diaria y comparte datos con el resto."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.05}>
              <a href={m.href} className="block h-full">
                <FeatureCard icon={m.icon} title={m.title} text={m.text} />
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <ProblemGrid />
      </Section>

      <Section>
        <TourGrid />
      </Section>

      <DemoCta />
    </MarketingLayout>
  );
}
