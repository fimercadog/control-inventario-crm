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
        eyebrow="Programas Formativos"
        title="Formación deportiva integral, de la iniciación al alto rendimiento"
        lead="Categorías Sub-8 a Sub-17, escuela de arqueros, preparación física y competición de liga — todo integrado con seguimiento ERP."
        image="/gallery/illustrations/illustration-7.png"
        imageAlt="Entrenador guiando a deportistas jóvenes"
        actions={
          <>
            <CtaLink href="/solicitar-cita" variant="cta">
              Solicitar clase de prueba
            </CtaLink>
            <CtaLink href="#todos-los-servicios" variant="outline">
              Ver todos los programas
            </CtaLink>
          </>
        }
      />

      <Section className="pt-0">
        <CircularPhotoAbout
          image="/gallery/pet-10.jpg"
          imageAlt="Entrenamiento de alto rendimiento en fútbol"
          eyebrow="Alto Rendimiento"
          title="Preparación competitiva para torneos oficiales"
        >
          <p>
            Nuestras categorías competitivas participan en la Liga Oficial de Fútbol con acompañamiento técnico por líneas, preparación física y seguimiento estadístico por partido.
          </p>
        </CircularPhotoAbout>
        <div className="mt-10">
          <PriorityBanner label="Inscripciones abiertas para liga" detail="+57 601 555 0188" />
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

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Metodología" title="Formación por etapas del desarrollo" />
        </Reveal>
        <div className="mt-12">
          <PhotoOverlayLinks
            title="Formación por etapas del desarrollo"
            image="/gallery/pet-7.jpg"
            imageAlt="Entrenamiento de fútbol juvenil"
            items={services.map((s) => ({
              label: s.title,
              href: `/servicios/${s.slug}`,
            }))}
          />
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Opiniones de padres de familia" />
        </Reveal>
        <div className="mt-12">
          <TestimonialGrid testimonials={testimonials} limit={3} />
        </div>
      </Section>

      <FloatingContactCard />

      <Section className="pt-0">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Preguntas sobre entrenamientos e inscripciones" />
        </Reveal>
        <div className="mt-12">
          <FaqColumns faqs={faqs} />
        </div>
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
