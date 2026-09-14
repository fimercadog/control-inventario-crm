import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { services } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceGrid } from "@/components/marketing/service-card";

export default function ServiciosPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Servicios"
        title="Atención veterinaria completa, de la consulta a la cirugía"
        lead="Consulta general, medicina preventiva, laboratorio, cirugía, odontología y más — todo con historia clínica digital por paciente."
      />

      <Section className="pt-0">
        <ServiceGrid services={services} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
