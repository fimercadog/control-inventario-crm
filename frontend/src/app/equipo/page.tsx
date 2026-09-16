import Image from "next/image";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { team } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { VetGrid } from "@/components/marketing/vet-card";

export default function EquipoPage() {
  return (
    <MarketingLayout>
      {/* Hero: mismo lenguaje visual de foto lavada que Nosotros. */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/gallery/pet-7.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-background/88" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal mount>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Equipo</p>
              <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                El equipo que va a conocer a tu mascota
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Veterinarios de planta y un equipo de recepción que coordina tu agenda, tus urgencias y el
                seguimiento de cada tratamiento.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/vet-clipboard.jpg"
          imageAlt="Veterinario del equipo con bata blanca e historia clínica"
          reverse
          features={[
            { title: "Continuidad, no rotación", text: "Cada mascota tiene un veterinario que la conoce visita tras visita, no un turno con quien esté disponible." },
            { title: "Seguimiento real", text: "Un cambio sutil se nota antes cuando es el mismo equipo el que compara con la visita anterior." },
          ]}
        />
      </Section>

      <Section className="bg-secondary/40">
        <VetGrid team={team} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
