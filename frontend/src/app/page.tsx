import Image from "next/image";
import { ArrowRight, Bird, Cat, Dog, HeartHandshake, MapPin, Rabbit, ShieldCheck, Sparkles, Stethoscope, Syringe } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
import { EmergencyBanner } from "@/components/marketing/emergency-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeHero } from "@/components/marketing/home-hero";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs, featuredServices, stats, team, testimonials } from "@/components/marketing/marketing-data";
import { FeatureCard, Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceGrid } from "@/components/marketing/service-card";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";
import { VetGrid } from "@/components/marketing/vet-card";

const whyUs = [
  { icon: Stethoscope, title: "Equipo con experiencia", text: "Veterinarios de planta, no rotativos: conocen a tu mascota visita tras visita." },
  { icon: Syringe, title: "Historia clínica digital", text: "Vacunas, consultas y tratamientos quedan registrados y no se pierden." },
  { icon: ShieldCheck, title: "Laboratorio propio", text: "Análisis básicos con resultados el mismo día, sin derivar a otro lado." },
  { icon: HeartHandshake, title: "Trato cercano", text: "Te explicamos cada diagnóstico en lenguaje claro, sin apuro." },
];

const speciesTreated = [
  { icon: Dog, label: "Perros" },
  { icon: Cat, label: "Gatos" },
  { icon: Rabbit, label: "Conejos" },
  { icon: Bird, label: "Aves" },
];

export default function Home() {
  return (
    <MarketingLayout>
      <HomeHero />

      {/* Servicios principales */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Servicios"
            title="Todo lo que tu mascota necesita, en un solo lugar"
            lead="Desde el control de rutina hasta la cirugía: estos son los servicios que más solicitan nuestros pacientes."
          />
        </Reveal>
        <div className="mt-14">
          <ServiceGrid services={featuredServices} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/servicios" variant="outline">
            Ver todos los servicios
          </CtaLink>
        </div>
      </Section>

      {/* Presentación de la clínica */}
      <Section className="bg-secondary/40">
        <Reveal>
          <SectionHeading eyebrow="La clínica" title="Más de una década cuidando mascotas del barrio" center={false} />
        </Reveal>
        <div className="mt-12">
          <PhotoFeatureStack
            image="/gallery/vet-clipboard.jpg"
            imageAlt="Veterinario con bata blanca revisando la historia clínica de un paciente"
            features={[
              { title: "Consultorios equipados", text: "Laboratorio propio y quirófano — sin derivar cada caso a otro lado." },
              { title: "Pocas mascotas, no muchas apuradas", text: "Cada consulta tiene el tiempo que necesita, no un cronómetro." },
              { title: "Calle 93 #14-20, Bogotá", text: "A dos cuadras de la Zona T. Lun a sáb, 8:00 a 19:00." },
            ]}
          />
        </div>
        <div className="mt-8 flex justify-center lg:justify-start">
          <CtaLink href="/nosotros" variant="outline" size="sm">
            Conocer la clínica
          </CtaLink>
        </div>
      </Section>

      {/* Por qué elegirnos */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Por qué elegirnos"
            title="Cuatro razones que notan nuestros propietarios"
          />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <FeatureCard icon={item.icon} title={item.title} text={item.text} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Equipo */}
      <Section dark>
        <Reveal>
          <SectionHeading
            eyebrow="Equipo profesional"
            title="Quién va a atender a tu mascota"
            lead="Veterinarios de planta y un equipo de recepción que coordina tu agenda y tus urgencias."
            dark
          />
        </Reveal>
        <div className="mt-14">
          <VetGrid team={team} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/equipo" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Conocer al equipo completo
            <ArrowRight className="size-4" />
          </CtaLink>
        </div>
      </Section>

      {/* Atención preventiva */}
      <Section className="bg-secondary/40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Atención preventiva</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Prevenir cuesta menos que curar
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Vacunación al día, desparasitación programada y un chequeo periódico detectan a tiempo lo que todavía
              no duele. Es la diferencia entre un control de rutina y una urgencia evitable.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6">
              {["Esquema de vacunación con recordatorio de próxima dosis", "Desparasitación interna y externa por peso y edad", "Chequeo anual (o semestral en pacientes senior)"].map(
                (item) => (
                  <li key={item} className="flex gap-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-8">
              <CtaLink href="/servicios/medicina-preventiva" variant="outline" size="sm">
                Ver medicina preventiva
              </CtaLink>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl shadow-elevation-3">
              <Image
                src="/gallery/paw-procedure.jpg"
                alt="Veterinario con guantes revisando la pata de un paciente"
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Urgencias */}
      <Section>
        <EmergencyBanner />
      </Section>

      {/* Estadísticas */}
      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      {/* Testimonios */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Lo que cuentan nuestros propietarios" />
        </Reveal>
        <div className="mt-14">
          <TestimonialGrid testimonials={testimonials} limit={3} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/testimonios" variant="outline">
            Ver todos los testimonios
          </CtaLink>
        </div>
      </Section>

      {/* Mascotas atendidas */}
      <Section className="bg-secondary/40">
        <Reveal>
          <SectionHeading eyebrow="A quién atendemos" title="Mascotas de todo tipo, un mismo estándar de cuidado" />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {speciesTreated.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-10 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
                  <item.icon className="size-7" />
                </span>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Preguntas frecuentes" title="Dudas comunes antes de tu primera visita" />
        </Reveal>
        <div className="mt-14">
          <FaqAccordion faqs={faqs.slice(0, 5)} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/preguntas-frecuentes" variant="outline">
            Ver todas las preguntas
          </CtaLink>
        </div>
      </Section>

      {/* CTA agendar */}
      <AppointmentCta />

      {/* Contacto / ubicación */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Visitanos</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Te esperamos en la clínica
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Calle 93 #14-20, Bogotá. Lunes a sábado de 8:00 a 19:00 — urgencias los 7 días.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/contacto" variant="outline">
                Ir a contacto
              </CtaLink>
              <CtaLink
                href="https://www.google.com/maps/search/?api=1&query=Calle+93+%2314-20%2C+Bogot%C3%A1"
                variant="ghost"
              >
                Ver en el mapa
              </CtaLink>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Calle+93+%2314-20%2C+Bogot%C3%A1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicación de la clínica en Google Maps"
              className="group relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-secondary"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-size-[28px_28px] text-primary/15 opacity-60"
              />
              <span className="relative flex flex-col items-center gap-2 text-primary">
                <MapPin className="size-9" />
                <span className="text-sm font-semibold text-foreground">Ver ubicación en Google Maps</span>
              </span>
            </a>
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
