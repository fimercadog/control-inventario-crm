import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { stats, testimonials } from "@/components/marketing/marketing-data";
import { Section } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";

export default function TestimoniosPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Testimonios"
        title="Lo que opinan los padres de familia y acudientes"
        lead="Experiencias reales de alumnos y familias que forman parte de Escuela de Fútbol La Cantera."
      />

      <Section className="pt-0">
        <StatsSection stats={stats} />
      </Section>

      <Section className="pt-0">
        <TestimonialGrid testimonials={testimonials} />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
