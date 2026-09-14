import { Heart, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { stats } from "@/components/marketing/marketing-data";
import { FeatureCard, Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { PhotoPlaceholder } from "@/components/marketing/photo-placeholder";
import { Reveal } from "@/components/marketing/reveal";
import { StatsSection } from "@/components/marketing/stats-section";

const values = [
  { icon: Heart, title: "Trato cercano", text: "Explicamos cada diagnóstico en lenguaje claro y con tiempo, no de pasada." },
  { icon: ShieldCheck, title: "Medicina responsable", text: "Ningún procedimiento sin explicarte el porqué y, si aplica, sin presupuesto previo." },
  { icon: Sparkles, title: "Mejora continua", text: "Historia clínica digital, laboratorio propio y seguimiento de cada tratamiento." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Nosotros"
        title="Una clínica de barrio, con el equipamiento de una grande"
        lead="Clínica Veterinaria Los Andes nació para que cada mascota tenga un equipo veterinario que la conozca de verdad, visita tras visita — no una cara distinta cada vez."
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Nuestra historia</p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Más de una década cuidando mascotas
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Empezamos como una consulta pequeña de barrio y hoy somos una clínica con consultorios equipados,
              laboratorio propio y quirófano — sin perder lo que nos trajo hasta acá: conocer a cada paciente por su
              nombre y a cada propietario por el suyo.
            </p>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Preferimos atender pocas mascotas bien que muchas apurados. Cada consulta tiene el tiempo que
              necesita, y cada historia clínica queda registrada para que el próximo veterinario que la vea sepa
              exactamente de dónde viene el caso.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <PhotoPlaceholder
              icon={Stethoscope}
              label="Foto de la clínica — próximamente"
              className="aspect-4/3 w-full rounded-4xl shadow-elevation-3"
            />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <Reveal>
          <SectionHeading eyebrow="Lo que nos mueve" title="Misión y valores" lead="Tres cosas que no negociamos, sin importar cuánto crezca la clínica." />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <FeatureCard icon={v.icon} title={v.title} text={v.text} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
