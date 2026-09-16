import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { ImageTextSection } from "@/components/marketing/image-text-section";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { stats } from "@/components/marketing/marketing-data";
import { FeatureCard, Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
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
        <ImageTextSection
          image="/gallery/pet-7.jpg"
          imageAlt="Veterinario del equipo revisando a un bulldog en consulta"
          eyebrow="Nuestra historia"
          title="Más de una década cuidando mascotas"
        >
          <p>
            Empezamos como una consulta pequeña de barrio y hoy somos una clínica con consultorios equipados,
            laboratorio propio y quirófano — sin perder lo que nos trajo hasta acá: conocer a cada paciente por su
            nombre y a cada propietario por el suyo.
          </p>
          <p className="mt-4">
            Preferimos atender pocas mascotas bien que muchas apurados. Cada consulta tiene el tiempo que necesita,
            y cada historia clínica queda registrada para que el próximo veterinario que la vea sepa exactamente de
            dónde viene el caso.
          </p>
        </ImageTextSection>
      </Section>

      <Section className="bg-secondary/40">
        <ImageTextSection
          image="/gallery/pet-8.jpg"
          imageAlt="Procedimiento veterinario con instrumental de precisión"
          eyebrow="Nuestras instalaciones"
          title="Equipamiento propio, sin derivar a otro lado"
          reverse
        >
          <p>
            Consultorios equipados, quirófano con monitoreo anestésico y laboratorio propio para los análisis más
            frecuentes. Cuando tu mascota necesita algo más que una consulta, seguimos siendo el mismo equipo el que
            la atiende.
          </p>
        </ImageTextSection>
      </Section>

      <Section>
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
