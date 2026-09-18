import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CircularPhotoAbout } from "@/components/marketing/circular-photo-about";
import { CtaLink } from "@/components/marketing/cta-link";
import { FaqColumns } from "@/components/marketing/faq-columns";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";
import { IconFeatureFloatCard } from "@/components/marketing/icon-feature-float-card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs, services, testimonials } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PhotoOverlayLinks } from "@/components/marketing/photo-overlay-links";
import { PriorityBanner } from "@/components/marketing/priority-banner";
import { Reveal } from "@/components/marketing/reveal";
import { SERVICE_ICON } from "@/components/marketing/service-card";
import { SplitHero } from "@/components/marketing/split-hero";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";

export default function ServiciosPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Soluciones CareNote"
        title="Plataforma integral para atención domiciliaria"
        lead="Dictado por voz en Telegram, estructuración automática de notas clínicas con IA, expediente de pacientes y reportes administrativos."
        image="/gallery/illustrations/illustration-7.png"
        imageAlt="Profesional realizando registro clínico por voz"
        actions={
          <>
            <CtaLink href="/login" variant="cta">
              Probar CareNote
            </CtaLink>
            <CtaLink href="#todos-los-servicios" variant="outline">
              Ver todas las funciones
            </CtaLink>
          </>
        }
      />

      <Section className="pt-0">
        <CircularPhotoAbout
          image="/gallery/pet-10.jpg"
          imageAlt="Procesamiento de voz por Telegram y n8n"
          eyebrow="Telegram Bot"
          title="Captura inmediata sin interrumpir tu consulta"
        >
          <p>
            Iniciá sesión con tu paciente desde Telegram, enviá tus notas en voz o texto y dejá que CareNote arme el informe clínico estructurado.
          </p>
        </CircularPhotoAbout>
        <div className="mt-10">
          <PriorityBanner label="Soporte y atención" detail="+57 601 555 0199" />
        </div>
      </Section>

      <div id="todos-los-servicios">
        <IconFeatureFloatCard
          items={services.map((s) => ({
            icon: SERVICE_ICON[s.slug] ?? "/gallery/icons/icon-16.png",

            title: s.title,
            text: s.short,
            href: `/servicios/${s.slug}`,
          }))}
        />
      </div>

      <PhotoOverlayLinks
        title="Funciones clave de CareNote"
        image="/gallery/paw-procedure.jpg"
        imageAlt="Interface de CareNote Domiciliario"
        items={services.map((s) => ({ label: s.title, href: `/servicios/${s.slug}` }))}
      />

      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <FloatingContactCard title="Contacto y soporte" />
      </div>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes" center={false} />
        </Reveal>
        <div className="mt-12">
          <FaqColumns faqs={faqs.slice(0, 6)} />
        </div>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Lo que expresan nuestros profesionales" />
        </Reveal>
        <div className="mt-12">
          <TestimonialGrid testimonials={testimonials} limit={2} />
        </div>
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
