import Image from "next/image";
import { AlertTriangle, Clock, PhoneCall, Stethoscope } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { ImageTextSection } from "@/components/marketing/image-text-section";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

const signs = [
  "Dificultad para respirar o encías muy pálidas o azuladas",
  "Vómito o diarrea persistente, sobre todo con sangre",
  "Convulsiones, desmayo o incapacidad de pararse",
  "Traumatismo: atropello, caída o golpe fuerte",
  "Sospecha de intoxicación (comió algo tóxico)",
  "Sangrado que no se detiene o herida abierta profunda",
  "Distensión o dolor abdominal severo",
  "Trabajo de parto complicado",
];

const steps = [
  { icon: PhoneCall, title: "Avisanos antes de venir", text: "Escribinos por WhatsApp o llamá a la clínica con el caso. El equipo se prepara mientras estás en camino." },
  { icon: Stethoscope, title: "Estabilización inmediata", text: "Al llegar, la prioridad es estabilizar: dolor, sangrado, respiración. El diagnóstico completo viene después." },
  { icon: Clock, title: "Seguimiento hasta el alta", text: "Si el paciente necesita quedar en observación, te mantenemos informado de su evolución." },
];

export default function UrgenciasPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Urgencias"
        title="Cuando no puede esperar, actuamos rápido"
        lead="Ante un accidente, una intoxicación o un cuadro que empeora rápido, escribinos o llamá antes de venir para que el equipo esté listo."
        actions={
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Urgencias por WhatsApp
          </CtaLink>
        }
        note="Atención de urgencias todos los días — línea directa disponible 24/7"
      />

      <Section className="pt-0">
        <Reveal>
          <SectionHeading eyebrow="¿Cuándo es una urgencia?" title="Señales que no hay que esperar a que pasen solas" center={false} />
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {signs.map((sign, i) => (
            <Reveal key={sign} delay={(i % 4) * 0.05}>
              <div className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-6">
                <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-warning" />
                <span>{sign}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Ante la duda, escribinos: es mejor una consulta de más que llegar tarde a una urgencia real.
        </p>
      </Section>

      <Section className="bg-secondary/40">
        <ImageTextSection
          image="/gallery/pet-10.jpg"
          imageAlt="Atención veterinaria de urgencia"
          eyebrow="Prioridad inmediata"
          title="Línea directa, sin trámite previo"
          reverse
        >
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card shadow-elevation-1">
              <Image src="/gallery/icons/icon-2.png" alt="" width={28} height={28} className="size-7" />
            </span>
            <p>
              Una urgencia no espera turno. Escribinos o llamá directo — el equipo se prepara mientras estás en
              camino, sin formularios ni agenda de por medio.
            </p>
          </div>
        </ImageTextSection>
      </Section>

      <Section dark>
        <Reveal>
          <SectionHeading eyebrow="Cómo funciona" title="Qué pasa cuando llegás con una urgencia" dark />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-chart-3">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{step.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </MarketingLayout>
  );
}
