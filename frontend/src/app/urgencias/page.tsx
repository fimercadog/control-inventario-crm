import { AlertTriangle, Clock, PhoneCall, ShieldCheck } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { PriorityBanner } from "@/components/marketing/priority-banner";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { Reveal } from "@/components/marketing/reveal";
import { SplitHero } from "@/components/marketing/split-hero";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

const signs = [
  "Traumatismo articular o esguince en entrenamiento o partido de liga",
  "Molestia o contractura muscular persistente en miembros inferiores",
  "Valoración preventiva pre-competencia y certificado de aptitud física",
  "Protocolos de hidratación y prevención de golpes de calor en campo",
  "Acompañamiento de fisioterapia y fortalecimiento neuromuscular",
  "Protocolos de retorno seguro al juego tras reposo deportivo",
];

const steps = [
  { icon: PhoneCall, title: "Reporte a la Coordinación", text: "Reporta la novedad física al preparador físico o cuerpo técnico de la categoría." },
  { icon: ShieldCheck, title: "Evaluación y Fisioterapia", text: "Valoración primaria de la lesión, crioterapia y plan de reacondicionamiento." },
  { icon: Clock, title: "Retorno Progresivo", text: "Seguimiento al alta médica antes de reincorporar al atleta al juego 11v11." },
];

export default function UrgenciasPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Salud & Fisioterapia"
        title="Atención médica deportiva y prevención de lesiones"
        lead="Acompañamiento de fisioterapia, acondicionamiento físico y protocolos de salud para nuestros atletas en competencia."
        image="/gallery/illustrations/illustration-8.png"
        imageAlt="Fisioterapia y acondicionamiento deportivo"
        actions={
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Contacto Directo por WhatsApp
          </CtaLink>
        }
      />
      <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <PriorityBanner label="Línea de Coordinación Médica" detail="+57 601 555 0188" />
      </div>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Atención Médica" title="Protocolos de acompañamiento al deportista" center={false} />
        </Reveal>
        <div className="mt-10 rounded-[2rem] bg-card p-6 shadow-elevation-4 sm:p-10">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {signs.map((sign, i) => (
              <Reveal key={sign} delay={(i % 4) * 0.05}>
                <div className="flex items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cta/10 text-cta">
                    <AlertTriangle className="size-3.5" />
                  </span>
                  <span className="text-sm font-medium leading-6">{sign}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Protocolo" title="¿Cómo actuamos ante una lesión deportiva?" />
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="rounded-3xl bg-card p-8 shadow-elevation-2">
                <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/pet-10.jpg"
          imageAlt="Preparador físico valorando a un jugador"
          features={[
            { title: "Prevención en Entrenamiento", text: "Protocolos de calentamiento preventivo FIFA 11+ en cada sesión." },
            { title: "Certificados Médicos ERP", text: "Ficha médica y de salud registrada en el sistema ERP del club." },
          ]}
        />
      </Section>
    </MarketingLayout>
  );
}
