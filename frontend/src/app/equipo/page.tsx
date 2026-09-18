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
      <SplitHero
        eyebrow="Equipo"
        title="Líderes y coordinadores de CareNote"
        lead="Profesionales de enfermería domiciliaria, fisioterapeutas e ingenieros de automatizaciones impulsando la excelencia asistencial."
        image="/gallery/illustrations/illustration-4.png"
        imageAlt="Coordinador de atención domiciliaria CareNote"
        actions={
          <CtaLink href="/login" variant="cta">
            Probar CareNote
          </CtaLink>
        }
      />

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/pet-13.jpg"
          imageAlt="Profesional realizando valoración domiciliaria"
          reverse
          features={[
            { title: "Soporte asistencial continuo", text: "Coordinadores y supervisores acompañando la práctica diaria en terreno." },
            { title: "Optimización de tiempo", text: "Reducción drástica de horas de oficina dedicadas a la transcripción manual." },
          ]}
        />
      </Section>

      <Section className="bg-section-cream">
        <TeamProfileList team={team} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
