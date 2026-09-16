import Image from "next/image";
import { CtaLink } from "@/components/marketing/cta-link";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { stats } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { OffsetBlobBlock } from "@/components/marketing/offset-blob-block";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { StatsSection } from "@/components/marketing/stats-section";

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero: foto full-bleed lavada (blanco) + texto encima -- patrón "About DiviVet" del pack. */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/gallery/vet-clipboard.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-background/88" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal mount>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Nosotros</p>
              <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Una clínica de barrio, con el equipamiento de una grande
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Clínica Veterinaria Los Andes nació para que cada mascota tenga un equipo veterinario que la
                conozca de verdad, visita tras visita — no una cara distinta cada vez.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Section>
        <PhotoFeatureStack
          image="/gallery/pet-7.jpg"
          imageAlt="Veterinario del equipo revisando a un bulldog en consulta"
          features={[
            { title: "Más de una década", text: "Empezamos como una consulta pequeña de barrio; hoy tenemos consultorios equipados, laboratorio propio y quirófano." },
            { title: "Pocas mascotas, no muchas apuradas", text: "Cada consulta tiene el tiempo que necesita, y cada historia clínica queda registrada." },
            { title: "El mismo equipo siempre", text: "Conocemos a cada paciente por su nombre y a cada propietario por el suyo." },
          ]}
        />
      </Section>

      <OffsetBlobBlock
        title="Nuestra misión y valores"
        image="/gallery/pet-8.jpg"
        imageAlt="Procedimiento veterinario con instrumental de precisión"
        actions={
          <CtaLink href="/servicios" variant="cta">
            Ver servicios
          </CtaLink>
        }
      >
        <ul className="mt-2 space-y-3 text-sm leading-6">
          <li>
            <strong className="font-bold">Trato cercano.</strong> Explicamos cada diagnóstico con tiempo, no de
            pasada.
          </li>
          <li>
            <strong className="font-bold">Medicina responsable.</strong> Ningún procedimiento sin explicar el
            porqué ni presupuesto previo.
          </li>
          <li>
            <strong className="font-bold">Mejora continua.</strong> Historia clínica digital y laboratorio propio.
          </li>
        </ul>
      </OffsetBlobBlock>

      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
