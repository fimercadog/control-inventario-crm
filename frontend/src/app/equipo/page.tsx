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
        eyebrow="Cuerpo Técnico"
        title="Formadores comprometidos con el futuro del fútbol juvenil"
        lead="Directores técnicos, preparadores físicos y coordinadores dedicados al desarrollo deportivo, táctico y humano de tu hijo."
        image="/gallery/illustrations/illustration-4.png"
        imageAlt="Entrenador de fútbol con pizarra táctica"
        actions={
          <CtaLink href="/solicitar-cita" variant="cta">
            Solicitar clase de prueba
          </CtaLink>
        }
      />

      <Section className="pt-0">
        <PhotoFeatureStack
          image="/gallery/pet-13.jpg"
          imageAlt="Entrenadores guiando rutina de agilidad y velocidad"
          reverse
          features={[
            { title: "Continuidad y Formación Integral", text: "Cada categoría cuenta con un cuerpo técnico enfocado en el seguimiento cercano de cada atleta." },
            { title: "Metodología Actualizada", text: "Planes de entrenamiento basados en estándares modernos de la Federación Colombiana de Fútbol." },
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
