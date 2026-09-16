import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { ImageTextSection } from "@/components/marketing/image-text-section";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { team } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { VetGrid } from "@/components/marketing/vet-card";

export default function EquipoPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Equipo"
        title="El equipo que va a conocer a tu mascota"
        lead="Veterinarios de planta y un equipo de recepción que coordina tu agenda, tus urgencias y el seguimiento de cada tratamiento."
      />

      <Section className="pt-0">
        <ImageTextSection
          image="/gallery/vet-clipboard.jpg"
          imageAlt="Veterinario del equipo con bata blanca e historia clínica"
          eyebrow="Continuidad, no rotación"
          title="Veterinarios de planta, no una cara distinta cada vez"
        >
          <p>
            Cada mascota tiene un veterinario que la conoce visita tras visita — no un turno con quien esté
            disponible. Eso hace que un cambio sutil se note antes, y que el tratamiento tenga seguimiento real.
          </p>
        </ImageTextSection>
      </Section>

      <Section className="bg-secondary/40">
        <VetGrid team={team} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
