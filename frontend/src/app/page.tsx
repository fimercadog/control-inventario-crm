import { ArrowRight, Activity, Droplet, HeartPulse, Sparkles, Syringe, Zap } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
import { EmergencyBanner } from "@/components/marketing/emergency-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeHero } from "@/components/marketing/home-hero";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { IconFeatureFloatCard } from "@/components/marketing/icon-feature-float-card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs, featuredServices, stats, team, testimonials } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { OffsetBlobBlock } from "@/components/marketing/offset-blob-block";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceGrid } from "@/components/marketing/service-card";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";
import { VetGrid } from "@/components/marketing/vet-card";

const whyUs = [
  { icon: "/gallery/icons/icon-16.png", title: "Médicos especialistas", text: "Médicos cirujanos y dermatólogos de planta especializados en medicina estética." },
  { icon: "/gallery/icons/icon-15.png", title: "Ficha & seguimiento digital", text: "Registro estricto de productos, lotes y evolución fotográfica clínica en cada sesión." },
  { icon: "/gallery/icons/icon-13.png", title: "Insumos 100% certificados", text: "Laboratorios líderes mundiales con aprobaciones de seguridad INVIMA y FDA." },
  { icon: "/gallery/icons/icon-11.png", title: "Resultados naturales", text: "Enfoque armónico y transparente: resaltamos tu belleza sin alterar tu expresión." },
];

const areasTreated = [
  { icon: Syringe, label: "Toxina Botulínica" },
  { icon: Sparkles, label: "Ácido Hialurónico" },
  { icon: Activity, label: "Bioestimuladores" },
  { icon: HeartPulse, label: "Sueroterapia IV" },
];

export default function Home() {
  return (
    <MarketingLayout>
      <HomeHero />

      {/* Tratamientos y servicios principales */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Tratamientos Élite"
            title="Medicina Estética & Antiaging de vanguardia"
            lead="Desde armonización facial sutil hasta rejuvenecimiento dérmico profundo: conoce nuestros protocolos estrella."
          />
        </Reveal>
        <div className="mt-14">
          <ServiceGrid services={featuredServices} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/servicios" variant="outline">
            Ver catálogo completo de tratamientos
          </CtaLink>
        </div>
      </Section>

      {/* Presentación de la clínica */}
      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Nuestra Clínica" title="Más de una década de excelencia en salud y belleza médica" center={false} />
        </Reveal>
        <div className="mt-12">
          <PhotoFeatureStack
            image="/gallery/clinic-1.jpg"
            imageAlt="Médica especialista aplicando tratamiento facial estético en consultorio de última generación"
            features={[
              { title: "Instalaciones médicas premium", text: "Consultorios privados bioseguros y equipamiento médico avanzado." },
              { title: "Atención personalizada y sin afanes", text: "Cada valoración médica dispone del tiempo necesario para planificar tus objetivos." },
              { title: "Ubicación privilegiada en Bogotá", text: "Calle 93 #14-20, Chico. Lunes a sábado de 8:00 a 19:00." },
            ]}
          />
        </div>
        <div className="mt-8 flex justify-center lg:justify-start">
          <CtaLink href="/nosotros" variant="outline" size="sm">
            Conocer nuestras instalaciones
          </CtaLink>
        </div>
      </Section>

      {/* Por qué elegirnos */}
      <Section className="pb-0">
        <Reveal>
          <SectionHeading
            eyebrow="Por qué elegirnos"
            title="Cuatro pilares de confianza de nuestros pacientes"
          />
        </Reveal>
      </Section>
      <IconFeatureFloatCard items={whyUs} />

      {/* Equipo médico */}
      <Section dark>
        <Reveal>
          <SectionHeading
            eyebrow="Equipo Profesional"
            title="Especialistas al cuidado de tu rostro y cuerpo"
            lead="Médicos certificados y coordinadores enfocados en brindarte una experiencia estética segura y confortable."
            dark
          />
        </Reveal>
        <div className="mt-14">
          <VetGrid team={team} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/equipo" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Conocer al equipo médico completo
            <ArrowRight className="size-4" />
          </CtaLink>
        </div>
      </Section>

      {/* Atención preventiva y antiaging */}
      <OffsetBlobBlock
        eyebrow="Enfoque Antiaging"
        title="La mejor versión de ti misma, año tras año"
        image="/gallery/clinic-3.jpg"
        imageAlt="Paciente sonriente en sesión de hidratación y rejuvenecimiento facial"
        actions={
          <CtaLink href="/servicios/bioestimuladores-colageno" variant="outline" size="sm">
            Ver bioestimuladores de colágeno
          </CtaLink>
        }
      >
        <p className="text-lg leading-8 text-muted-foreground">
          Prevenir y desacelerar el envejecimiento dérmico mediante la estimulación celular es el estándar de oro de la medicina estética moderna.
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6">
          {[
            "Inducción natural de colágeno propio sin añadir volúmenes artificiales",
            "Tratamientos preventivos desde los 28-30 años para mantener la densidad de la piel",
            "Protocolos combinados con sueroterapia desintoxicante e hidratación biocompatible",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </OffsetBlobBlock>

      {/* Cita / Asesoría prioritaria */}
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
          <SectionHeading eyebrow="Testimonios" title="Experiencias reales de nuestros pacientes" />
        </Reveal>
        <div className="mt-14">
          <TestimonialGrid testimonials={testimonials} limit={3} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/testimonios" variant="outline">
            Ver todas las opiniones
          </CtaLink>
        </div>
      </Section>

      {/* Áreas y tratamientos */}
      <Section className="relative isolate overflow-hidden">
        <GradientBlob className="-right-24 -bottom-24 size-[110%] opacity-30" />
        <Reveal>
          <SectionHeading eyebrow="Especialidades" title="Especialización médica en áreas clave de rejuvenecimiento" />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-x-4 gap-y-10 rounded-[2.5rem] bg-card p-8 shadow-elevation-4 sm:grid-cols-4 sm:p-12">
            {areasTreated.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
                  <item.icon className="size-7" />
                </span>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Preguntas Frecuentes" title="Dudas comunes antes de tu primera valoración médica" />
        </Reveal>
        <div className="mt-14">
          <FaqAccordion faqs={faqs.slice(0, 5)} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/preguntas-frecuentes" variant="outline">
            Ver todas las preguntas frecuentes
          </CtaLink>
        </div>
      </Section>

      {/* CTA agendar */}
      <AppointmentCta />

      {/* Contacto / ubicación */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">Ubicación & Contacto</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Te esperamos en nuestra sede principal
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Calle 93 #14-20, Chicó, Bogotá. Lunes a sábado de 8:00 a 19:00.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/contacto" variant="outline">
                Ir a formulario de contacto
              </CtaLink>
              <CtaLink
                href="https://www.google.com/maps/search/?api=1&query=Calle+93+%2314-20%2C+Bogot%C3%A1"
                variant="ghost"
              >
                Ver en Google Maps
              </CtaLink>
            </div>
          </Reveal>
          <Reveal delay={0.1} direction="fade" duration={0.8}>
            <div className="aspect-4/3 w-full overflow-hidden rounded-3xl shadow-elevation-3">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d127238.10319071656!2d-74.16085941045108!3d4.736901797248434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sla%2026%20con%207!5e0!3m2!1ses!2sco!4v1789530874639!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Ubicación de Clínica Estética Élite en Google Maps"
                className="size-full"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
