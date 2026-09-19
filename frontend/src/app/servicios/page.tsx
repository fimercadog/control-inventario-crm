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
        eyebrow="Tratamientos & Catálogo Médica"
        title="Medicina Estética & Antiaging integral"
        lead="Toxina Botulínica, Ácido Hialurónico, Bioestimuladores de Colágeno, Peeling Médico, Hydrafacial y Sueroterapia — procedimientos bioseguros diseñados por médicos especialistas."
        image="/gallery/illustrations/illustration-7.png"
        imageAlt="Valoración estética facial personalizada"
        actions={
          <>
            <CtaLink href="/agendar-cita" variant="cta">
              Agendar Valoración
            </CtaLink>
            <CtaLink href="#todos-los-servicios" variant="outline">
              Ver catálogo completo
            </CtaLink>
          </>
        }
      />

      <Section className="pt-0">
        <CircularPhotoAbout
          image="/gallery/clinic-2.jpg"
          imageAlt="Asesoría y valoración estética en consultorio"
          eyebrow="Valoración Médica"
          title="Diagnóstico facial y corporal bioseguro"
        >
          <p>
            Cada rostro requiere una planificación anatómica única. Evaluamos tu piel con diagnóstico computarizado para diseñar la combinación ideal de tratamientos sin sobrecargar tus expresiones.
          </p>
        </CircularPhotoAbout>
        <div className="mt-10">
          <PriorityBanner label="Atención Médica Directa por WhatsApp" detail="+57 300 912 8472" />
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

      <PhotoOverlayLinks
        title="Catálogo de Procedimientos Estéticos"
        image="/gallery/clinic-3.jpg"
        imageAlt="Procedimiento de medicina estética"
        items={services.map((s) => ({ label: s.title, href: `/servicios/${s.slug}` }))}
      />

      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <FloatingContactCard title="Resuelve tus dudas directamente con nuestro equipo" />
      </div>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Preguntas Frecuentes sobre nuestros procedimientos" center={false} />
        </Reveal>
        <div className="mt-12">
          <FaqColumns faqs={faqs.slice(0, 6)} />
        </div>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Opiniones de nuestros pacientes" />
        </Reveal>
        <div className="mt-12">
          <TestimonialGrid testimonials={testimonials} limit={2} />
        </div>
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
