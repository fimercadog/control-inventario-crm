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
  "Dificultad respiratoria aguda o alteración hemodinámica",
  "Descompensación de signos vitales o dolor agudo severo",
  "Caída severa con pérdida de movilidad o sospecha de trauma",
  "Complicación inmediata en accesos vasculares, catéteres o sondas",
  "Sangrado activo descompensado o herida desbordada",
  "Reacción adversa grave a medicamentos o insumos",
  "Crisis hipertensiva o alteración de estado de conciencia",
  "Complicación posoperatoria en atención domiciliaria",
];

const steps = [
  { icon: PhoneCall, title: "Aviso y triage inmediato", text: "Comunícate por WhatsApp o llamada. El profesional asignado evalúa la prioridad y se desplaza inmediatamente." },
  { icon: Stethoscope, title: "Atención y estabilización", text: "Al llegar, la enfermera o terapeuta realiza la estabilización, toma de signos vitales y maniobras asistenciales." },
  { icon: Clock, title: "Registro y reporte automático", text: "El informe de la atención prioritaria se envía automáticamente al médico tratante y al familiar responsable." },
];

export default function UrgenciasPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Atención Prioritaria"
        title="Respuesta rápida cuando el paciente lo requiere"
        lead="Ante una descompensación, dolor agudo o complicación en domicilio, nuestro equipo de enfermería y terapeutas está listo para intervenir."
        image="/carenote/procedure-care.jpg"
        imageAlt="Enfermera realizando atención domiciliaria prioritaria"
        actions={
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Atención prioritaria por WhatsApp
          </CtaLink>
        }
      />
      <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <PriorityBanner label="Línea prioritaria 24/7" detail="+57 601 555 0188" />
      </div>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="¿Cuándo solicitar atención prioritaria?" title="Señales clínicas de alerta en domicilio" center={false} />
        </Reveal>
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
          Ante cualquier duda clínica, comunícate con la central de atención domiciliaria CareNote.
        </p>
      </Section>

      <Section className="bg-section-cream">
        <PhotoFeatureStack
          image="/carenote/procedure-care.jpg"
          imageAlt="Procedimiento clínico domiciliario de urgencia"
          reverse
          features={[
            { title: "Prioridad asistencial", text: "El profesional asignado recibe la alerta en tiempo real con la ubicación del paciente." },
            { title: "Reporte directo al especialista", text: "Cada evento priorizado genera una nota de voz y un reporte estructurado instantáneo con n8n e IA." },
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
