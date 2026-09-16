import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { serviceBySlug, services } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { SERVICE_ICON, ServiceGrid } from "@/components/marketing/service-card";

const SERVICE_PHOTO: Record<string, string> = {
  "consulta-veterinaria": "/gallery/hero-bulldog-exam.jpg",
  vacunacion: "/gallery/pet-4.jpg",
  cirugia: "/gallery/pet-13.jpg",
  "laboratorio-clinico": "/gallery/vet-clipboard.jpg",
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const iconSrc = SERVICE_ICON[service.slug];
  const photo = SERVICE_PHOTO[service.slug] ?? "/gallery/paw-procedure.jpg";
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Servicios"
        title={service.title}
        lead={service.description}
        actions={
          <CtaLink href="/agendar-cita" variant="cta">
            Agendar este servicio
          </CtaLink>
        }
      />

      <Section className="pt-0">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl shadow-elevation-3">
              <Image src={photo} alt="" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="grid size-16 place-items-center rounded-2xl bg-secondary">
              {iconSrc ? (
                <Image src={iconSrc} alt="" width={36} height={36} className="size-9" />
              ) : (
                <service.icon className="size-7 text-primary" />
              )}
            </span>
            <ul className="mt-8 space-y-3">
              {service.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-base leading-7">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-secondary/40 pt-0">
        <Reveal>
          <SectionHeading eyebrow="También te puede interesar" title="Otros servicios de la clínica" />
        </Reveal>
        <div className="mt-12">
          <ServiceGrid services={related} />
        </div>
      </Section>

      <AppointmentCta
        title={`¿Agendamos ${service.title.toLowerCase()} para tu mascota?`}
        lead="Contanos el caso y te confirmamos disponibilidad. Para urgencias, escribinos directo por WhatsApp."
      />
    </MarketingLayout>
  );
}
