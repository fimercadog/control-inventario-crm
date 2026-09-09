import { CatalogPreview } from "@/components/marketing/catalog-preview";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
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
        eyebrow="Software para clínicas veterinarias"
        title={
          <>
            Atiende, agenda y controla tu clínica desde{" "}
            <span className="animate-marketing-gradient-text">un solo lugar</span>
          </>
        }
        lead="Propietarios, pacientes, historia clínica, agenda, vacunas e inventario conectados. La aplicación de una vacuna descuenta el producto del stock; la solicitud de cita del sitio llega lista para agendar."
        visual="cluster"
        actions={
          <>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/producto" variant="outline">
              Ver como funciona
            </CtaLink>
          </>
        }
        note="Roles y permisos · historia clínica con respaldo · exportaciones CSV y PDF"
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
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Asistente de IA</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Consulta la clínica sin entrar a cada modulo
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/70">
              Una capa conversacional para preguntar por la historia de un paciente, las vacunas por vencer o la
              agenda del día. Interfaz lista; falta conectar el proveedor.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "vacunas por vencer esta semana",
            "historia rápida de un paciente",
            "agenda del día por profesional",
            "stock de un medicamento",
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
