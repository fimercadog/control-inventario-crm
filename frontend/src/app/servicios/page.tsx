import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CircularPhotoAbout } from "@/components/marketing/circular-photo-about";
import { CtaLink } from "@/components/marketing/cta-link";
import { IconFeatureFloatCard } from "@/components/marketing/icon-feature-float-card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { services } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PriorityBanner } from "@/components/marketing/priority-banner";
import { SERVICE_ICON } from "@/components/marketing/service-card";
import { SplitHero } from "@/components/marketing/split-hero";

export default function ServiciosPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Servicios"
        title="Atención veterinaria completa, de la consulta a la cirugía"
        lead="Consulta general, medicina preventiva, laboratorio, cirugía, odontología y más — todo con historia clínica digital por paciente."
        image="/gallery/illustrations/illustration-7.png"
        imageAlt="Veterinario revisando la boca de un gato en consulta"
        actions={
          <>
            <CtaLink href="/agendar-cita" variant="cta">
              Agendar cita
            </CtaLink>
            <CtaLink href="#todos-los-servicios" variant="outline">
              Ver todos los servicios
            </CtaLink>
          </>
        }
      />

      <Section className="pt-0">
        <CircularPhotoAbout
          image="/gallery/pet-10.jpg"
          imageAlt="Atención veterinaria de urgencia"
          eyebrow="Urgencias"
          title="Prioridad inmediata cuando no puede esperar"
        >
          <p>
            Ante un accidente, una intoxicación o un cuadro que empeora rápido, la prioridad es estabilizar.
            Escribinos antes de venir para que el equipo esté listo cuando llegues.
          </p>
        </CircularPhotoAbout>
        <div className="mt-10">
          <PriorityBanner label="Urgencias, escribinos ya" detail="+57 601 555 0188" />
        </div>
      </Section>

      <div id="todos-los-servicios">
        <IconFeatureFloatCard
          items={services.map((s) => ({
            icon: SERVICE_ICON[s.slug],
            title: s.title,
            text: s.short,
            href: `/servicios/${s.slug}`,
          }))}
        />
      </div>

      <AppointmentCta />
    </MarketingLayout>
  );
}
