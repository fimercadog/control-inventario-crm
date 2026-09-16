import { CheckCircle2 } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { ImageTextSection } from "@/components/marketing/image-text-section";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { services } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceGrid } from "@/components/marketing/service-card";

const highlights = [
  "Veterinarios de planta, no rotativos",
  "Historia clínica digital por paciente",
  "Laboratorio propio con resultados el mismo día",
];

export default function ServiciosPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Servicios"
        title="Atención veterinaria completa, de la consulta a la cirugía"
        lead="Consulta general, medicina preventiva, laboratorio, cirugía, odontología y más — todo con historia clínica digital por paciente."
      />

      <Section className="pt-0">
        <ImageTextSection
          image="/gallery/hero-bulldog-exam.jpg"
          imageAlt="Veterinario revisando a un paciente en la camilla de consulta"
          eyebrow="Cómo trabajamos"
          title="Un mismo equipo, del control de rutina a la cirugía"
        >
          <p>
            No derivamos cada caso a otro lado: consulta, laboratorio, cirugía e internación quedan bajo el mismo
            techo y el mismo equipo que ya conoce a tu mascota.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ImageTextSection>
      </Section>

      <Section className="bg-secondary/40 pt-0">
        <ServiceGrid services={services} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
