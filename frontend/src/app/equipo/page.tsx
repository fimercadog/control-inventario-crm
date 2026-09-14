import { AppointmentCta } from "@/components/marketing/appointment-cta";
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
        <VetGrid team={team} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
