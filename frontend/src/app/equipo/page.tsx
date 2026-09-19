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
        eyebrow="Equipo Médico"
        title="Especialistas dedicados a resaltar tu belleza natural"
        lead="Médicos cirujanos, dermatólogos y coordinadores de experiencia médica enfocados en brindar un seguimiento bioseguro y personalizado."
        image="/gallery/illustrations/illustration-4.png"
        imageAlt="Médico especialista en consultorio de medicina estética"
        actions={
          <CtaLink href="/agendar-cita" variant="cta">
            Agendar Valoración
          </CtaLink>
        }
      />

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/clinic-4.jpg"
          imageAlt="Médico realizando procedimiento de medicina estética"
          reverse
          features={[
            { title: "Atención por Médicos Especialistas", text: "Cada inyectable o procedimiento láser es realizado de forma exclusiva por médicos profesionales graduados." },
            { title: "Seguimiento Fotográfico & Clínico", text: "Registramos cada avance y resultado para asegurar la máxima satisfacción y naturalidad." },
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
