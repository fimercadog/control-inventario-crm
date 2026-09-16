import Image from "next/image";
import { AlertTriangle, Clock, PhoneCall, Stethoscope } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { PriorityBanner } from "@/components/marketing/priority-banner";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
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
      {/* Hero de foto full-bleed, igual tratamiento que Home pero con acento de urgencia. */}
      <section className="relative isolate">
        <div className="relative h-[520px] w-full overflow-hidden sm:h-[600px]">
          <Image
            src="/gallery/pet-10.jpg"
            alt="Atención veterinaria de urgencia"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/60 to-ink/15" />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-warning">Urgencias</p>
              <h1 className="mt-4 text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
                Cuando no puede esperar, actuamos rápido
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
                Ante un accidente, una intoxicación o un cuadro que empeora rápido, escribinos o llamá antes de
                venir para que el equipo esté listo.
              </p>
              <div className="mt-9">
                <CtaLink href={WHATSAPP_URL} variant="cta">
                  <PhoneCall className="size-4" />
                  Urgencias por WhatsApp
                </CtaLink>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
          <PriorityBanner label="Línea directa 24/7" detail="+57 601 555 0188" />
        </div>
      </section>

      <Section>
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
        <PhotoFeatureStack
          image="/gallery/paw-procedure.jpg"
          imageAlt="Procedimiento veterinario de urgencia"
          reverse
          features={[
            { title: "Prioridad inmediata", text: "Una urgencia no espera turno ni agenda. El equipo se prepara mientras estás en camino." },
            { title: "Sin trámite previo", text: "Escribinos o llamá directo — no hace falta formulario ni cita para que te atendamos." },
          ]}
        />
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
