import { CatalogPreview } from "@/components/marketing/catalog-preview";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Eyebrow } from "@/components/marketing/page-hero";
import {
  DemoCta,
  PlataformaGrid,
  ProblemGrid,
  Section,
  TourGrid,
} from "@/components/marketing/marketing-ui";

export default function Home() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="CRM + Control de inventario"
        title={
          <>
            Vende y controla tu inventario desde{" "}
            <span className="animate-marketing-gradient-text">un solo lugar</span>
          </>
        }
        lead="CRM y control de inventario conectados: leads, clientes, deals, productos, bodegas y compras. El pedido de venta descuenta stock de la bodega al confirmarse."
        visual="cluster"
        actions={
          <>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/producto" variant="outline">
              Ver como funciona
            </CtaLink>
          </>
        }
        note="Multiempresa · roles y permisos · exportaciones CSV y PDF"
      />

      <Section>
        <PlataformaGrid />
      </Section>

      <Section className="bg-secondary/40">
        <ProblemGrid />
      </Section>

      <Section>
        <TourGrid />
      </Section>

      <CatalogPreview />

      <Section dark>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Asistente de IA</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Consulta tu operacion sin entrar a cada modulo
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/70">
              Una capa conversacional para preguntar por stock disponible, datos de un cliente o el estado de un
              pedido. Interfaz lista; falta conectar el proveedor.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "consultar stock por bodega",
            "ficha rapida de cliente",
            "estado de un pedido",
            "crear un pedido de venta",
          ].map((item, i) => (
            <Reveal key={item} delay={i * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">{item}</div>
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </MarketingLayout>
  );
}
