import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { team } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { SplitHero } from "@/components/marketing/split-hero";
import { TeamProfileList } from "@/components/marketing/team-profile-row";

export default function EquipoPage() {
  return (
    <MarketingLayout>
      {/* Hero: misma familia visual que Servicios/Nosotros. */}
      <SplitHero
        eyebrow="Equipo"
        title="El equipo que va a conocer a tu mascota"
        lead="Veterinarios de planta y un equipo de recepción que coordina tu agenda, tus urgencias y el seguimiento de cada tratamiento."
        image="/gallery/illustrations/illustration-4.png"
        imageAlt="Veterinario sosteniendo en brazos a un cachorro"
        actions={
          <CtaLink href="/agendar-cita" variant="cta">
            Agendar cita
          </CtaLink>
        }
      />

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/pet-13.jpg"
          imageAlt="Veterinario examinando la pata de un bulldog con instrumental clínico"
          reverse
          features={[
            { title: "Continuidad, no rotación", text: "Cada mascota tiene un veterinario que la conoce visita tras visita, no un turno con quien esté disponible." },
            { title: "Seguimiento real", text: "Un cambio sutil se nota antes cuando es el mismo equipo el que compara con la visita anterior." },
          ]}
        />
      </Section>

      {/* Fila apilada foto+card -- patron "Highly Trained Veterinarians" de
          About, en vez de un grid de tarjetas parejas. */}
      <Section className="bg-section-cream">
        <TeamProfileList team={team} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
