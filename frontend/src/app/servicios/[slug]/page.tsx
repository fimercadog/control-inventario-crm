import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CircularPhotoAbout } from "@/components/marketing/circular-photo-about";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { serviceBySlug, services, testimonials } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceGrid } from "@/components/marketing/service-card";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

const SERVICE_PHOTO: Record<string, string> = {
  "toxina-botulinica": "/gallery/aesthetic/rejuvenecimiento_facial.jpg",
  "acido-hialuronico": "/gallery/aesthetic/armonizacion_perfilado.jpg",
  "limpieza-facial-profunda": "/gallery/aesthetic/limpieza_dermocosmiatria.jpg",
  "bioestimuladores-colageno": "/gallery/aesthetic/rejuvenecimiento_facial.jpg",
  "contorno-corporal": "/gallery/aesthetic/tratamiento_corporal.jpg",
  "peeling-medico": "/gallery/aesthetic/limpieza_dermocosmiatria.jpg",
  "sueroterapia-antiaging": "/gallery/aesthetic/cabina_clinica.jpg",
  "valoracion-medica-estetica": "/gallery/aesthetic/cabina_clinica.jpg",
  "depilacion-laser-medica": "/gallery/aesthetic/fototratamientos_laser.jpg",
  "rejuvenecimiento-laser": "/gallery/aesthetic/fototratamientos_laser.jpg",
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const ServiceIcon = service.icon;
  const photo = SERVICE_PHOTO[service.slug] ?? "/gallery/aesthetic/hero_aesthetic.jpg";
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <MarketingLayout>
      {/* Hero: foto de fondo desenfocada + foto nítida recuadrada en capas -- patrón "Service Detail" del pack. */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image src={photo} alt="" fill sizes="100vw" className="object-cover opacity-25 blur-2xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <Reveal mount>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">Servicios</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">{service.description}</p>
            {/* Dos botones apilados + link a FAQ -- mismo patron del hero de
                Service Detail en el pack (Make an Appointment / Chat with a Doctor). */}
            <div className="mt-8 flex flex-col items-start gap-3">
              <CtaLink href="/agendar-cita" variant="cta">
                Agendar este tratamiento
              </CtaLink>
              <CtaLink href={WHATSAPP_URL} variant="default" size="sm">
                Hablar con un especialista
              </CtaLink>
            </div>
            <CtaLink href="/preguntas-frecuentes" variant="ghost" size="sm" className="mt-3 px-0">
              Preguntas frecuentes
            </CtaLink>
          </Reveal>
          <Reveal mount zoom delay={0.15}>
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] shadow-elevation-4">
              <Image src={photo} alt="" fill sizes="(min-width: 1024px) 35vw, 85vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <Section className="pt-0">
        <CircularPhotoAbout
          image={photo}
          imageAlt={`Detalle de ${service.title.toLowerCase()}`}
          eyebrow="Qué incluye"
          title={`Sobre ${service.title.toLowerCase()}`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ServiceIcon className="size-5" />
            </span>
            <p>{service.description}</p>
          </div>
          <ul className="mt-6 space-y-3">
            {service.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-base leading-7">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </CircularPhotoAbout>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Lo que dicen nuestros pacientes" />
        </Reveal>
        <div className="mt-12">
          <TestimonialGrid testimonials={testimonials} limit={2} />
        </div>
      </Section>

      <Section className="bg-section-cream pt-0">
        <Reveal>
          <SectionHeading eyebrow="También te puede interesar" title="Otros tratamientos destacados" />
        </Reveal>
        <div className="mt-12">
          <ServiceGrid services={related} />
        </div>
      </Section>

      <AppointmentCta
        title={`¿Deseas agendar tu valoración para ${service.title.toLowerCase()}?`}
        lead="Reserva tu cita médica y aclara todas tus inquietudes directamente con nuestro equipo de especialistas."
      />
    </MarketingLayout>
  );
}
