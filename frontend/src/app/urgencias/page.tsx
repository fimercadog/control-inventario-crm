import { AlertTriangle, Clock, PhoneCall, Stethoscope } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { PriorityBanner } from "@/components/marketing/priority-banner";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { Reveal } from "@/components/marketing/reveal";
import { SplitHero } from "@/components/marketing/split-hero";
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
      {/* Hero: misma familia visual que Servicios/Productos/Equipo/Nosotros/Blog
          -- ilustracion protagonista (veterinario aplicando una inyeccion, sobre
          fondo rojo/salmon, tono de alerta) en vez del full-bleed anterior. */}
      <SplitHero
        eyebrow="Urgencias"
        title="Cuando no puede esperar, actuamos rápido"
        lead="Ante un accidente, una intoxicación o un cuadro que empeora rápido, escribinos o llamá antes de venir para que el equipo esté listo."
        image="/gallery/illustrations/illustration-8.png"
        imageAlt="Veterinaria aplicando una inyección a un gato"
        actions={
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Urgencias por WhatsApp
          </CtaLink>
        }
      />
      <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <PriorityBanner label="Línea directa 24/7" detail="+57 601 555 0188" />
      </div>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="¿Cuándo es una urgencia?" title="Señales que no hay que esperar a que pasen solas" center={false} />
        </Reveal>
        {/* Una sola tarjeta flotante sin bordes por item -- mismo patron que
            IconFeatureFloatCard, no un grid de cards individuales. */}
        <div className="mt-10 rounded-[2rem] bg-card p-6 shadow-elevation-4 sm:p-10">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {signs.map((sign, i) => (
              <Reveal key={sign} delay={(i % 4) * 0.05}>
                <div className="flex gap-3 text-sm leading-6">
                  <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-warning" />
                  <span>{sign}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Ante la duda, escribinos: es mejor una consulta de más que llegar tarde a una urgencia real.
        </p>
      </Section>

      <Section className="bg-section-cream">
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
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-chart-3">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{step.text}</p>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </MarketingLayout>
  );
}
