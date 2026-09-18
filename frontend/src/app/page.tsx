import { Activity, ArrowRight, Bot, Brain, Headphones, HeartPulse, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeHero } from "@/components/marketing/home-hero";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { IconFeatureFloatCard } from "@/components/marketing/icon-feature-float-card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs, featuredServices, stats, team, testimonials } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { OffsetBlobBlock } from "@/components/marketing/offset-blob-block";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceGrid } from "@/components/marketing/service-card";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";
import { VetGrid } from "@/components/marketing/vet-card";

const whyUs = [
  { icon: "/gallery/icons/icon-16.png", title: "Captura por voz en Telegram", text: "Dictá tus evoluciones en audios naturales durante o al finalizar cada visita." },
  { icon: "/gallery/icons/icon-15.png", title: "Informes estructurados con IA", text: "n8n e IA convierten la nota de voz en un informe clínico impecable en segundos." },
  { icon: "/gallery/icons/icon-13.png", title: "Múltiples audios por sesión", text: "Enviá varios audios durante la atención manteniendo el mismo contexto clínico." },
  { icon: "/gallery/icons/icon-11.png", title: "Gestión clínica unificada", text: "Expediente del paciente, atenciones, firmas de privacidad y panel administrativo." },
];

const targetProfiles = [
  { icon: Stethoscope, label: "Enfermería Domiciliaria" },
  { icon: Activity, label: "Fisioterapia" },
  { icon: HeartPulse, label: "Terapia Respiratoria" },
  { icon: Users, label: "Terapia Ocupacional" },
  { icon: Headphones, label: "Fonoaudiología" },
];

export default function Home() {
  return (
    <MarketingLayout>
      <HomeHero />

      {/* Servicios principales */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="CareNote Soluciones"
            title="Diseñado para profesionales de atención domiciliaria"
            lead="Desde la captura de voz en Telegram hasta la emisión del informe clínico estructurado."
          />
        </Reveal>
        <div className="mt-14">
          <ServiceGrid services={featuredServices} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/servicios" variant="outline">
            Ver todas las funciones
          </CtaLink>
        </div>
      </Section>

      {/* Presentación del flujo de trabajo */}
      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading
            eyebrow="Flujo de trabajo"
            title="De la conversación por voz al informe clínico en 3 pasos"
            center={false}
          />
        </Reveal>
        <div className="mt-12">
          <PhotoFeatureStack
            image="/gallery/pet-7.jpg"
            imageAlt="Profesional de enfermería domiciliaria tomando registros clínicos"
            features={[
              { title: "1. Abrí sesión en Telegram", text: "Seleccioná al paciente y confirmá la atención domiciliaria en el bot de Telegram." },
              { title: "2. Dictá tus hallazgos", text: "Enviá audios o notas de texto libre durante o entre visitas sin límites de tiempo por sesión." },
              { title: "3. Recibí e imprimí el informe", text: "CareNote genera el informe estructurado con signos vitales, intervenciones y plan de cuidados." },
            ]}
          />
        </div>
        <div className="mt-8 flex justify-center lg:justify-start">
          <CtaLink href="/login" variant="outline" size="sm">
            Iniciar sesión en el panel
          </CtaLink>
        </div>
      </Section>

      {/* Por qué elegirnos */}
      <Section className="pb-0">
        <Reveal>
          <SectionHeading
            eyebrow="Beneficios clave"
            title="Cuatro razones por las que los profesionales eligen CareNote"
          />
        </Reveal>
      </Section>
      <IconFeatureFloatCard items={whyUs} />

      {/* Equipo */}
      <Section dark>
        <Reveal>
          <SectionHeading
            eyebrow="Equipo y Coordinación"
            title="Líderes de área e integración"
            lead="Coordinadores de enfermería, terapias y automatizaciones al servicio de tu práctica diaria."
            dark
          />
        </Reveal>
        <div className="mt-14">
          <VetGrid team={team} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/equipo" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Conocer al equipo
            <ArrowRight className="size-4" />
          </CtaLink>
        </div>
      </Section>

      {/* Automatización inteligente */}
      <OffsetBlobBlock
        eyebrow="Tecnología CareNote"
        title="Automatización sin perder el toque humano"
        image="/gallery/paw-procedure.jpg"
        imageAlt="Profesional de salud atendiendo a un paciente en casa"
        actions={
          <CtaLink href="/servicios" variant="outline" size="sm">
            Conocer automatización
          </CtaLink>
        }
      >
        <p className="text-lg leading-8 text-muted-foreground">
          CareNote utiliza flujos de n8n e Inteligencia Artificial especializada para que la tecnología trabaje para vos, liberándote de horas de redacción nocturna.
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6">
          {[
            "Captura de múltiples audios dentro del mismo encuentro clínico",
            "Extracción automática de constantes vitales y alertas",
            "Cumplimiento de estándares de privacidad y consentimiento digital",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </OffsetBlobBlock>

      {/* Estadísticas */}
      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      {/* Testimonios */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Lo que dicen los profesionales que ya usan CareNote" />
        </Reveal>
        <div className="mt-14">
          <TestimonialGrid testimonials={testimonials} limit={4} />
        </div>
      </Section>

      {/* Perfiles atendidos */}
      <Section className="relative isolate overflow-hidden">
        <GradientBlob className="-right-24 -bottom-24 size-[110%] opacity-30" />
        <Reveal>
          <SectionHeading eyebrow="Para quién es CareNote" title="Especialidades de atención domiciliaria" />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-x-4 gap-y-10 rounded-[2.5rem] bg-card p-8 shadow-elevation-4 sm:grid-cols-5 sm:p-12">
            {targetProfiles.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
                  <item.icon className="size-7" />
                </span>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Preguntas frecuentes" title="Respuesta a las dudas más comunes sobre CareNote" />
        </Reveal>
        <div className="mt-14">
          <FaqAccordion faqs={faqs.slice(0, 5)} />
        </div>
      </Section>
    </MarketingLayout>
  );
}
