import { ArrowRight, Trophy, Users, ShieldCheck, Activity, Sparkles } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
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
  { icon: "/gallery/icons/icon-16.png", title: "Cuerpo técnico FCF", text: "Entrenadores y preparadores físicos licenciados dedicados a la formación integral." },
  { icon: "/gallery/icons/icon-15.png", title: "Seguimiento ERP Cantera", text: "Ficha deportiva digital, control de asistencia y estado de mensualidades en tiempo real." },
  { icon: "/gallery/icons/icon-13.png", title: "Competencia oficial", text: "Participación en Torneos de Liga y festivales zonales en todas las categorías." },
  { icon: "/gallery/icons/icon-11.png", title: "Formación en valores", text: "Disciplina, trabajo en equipo, fair play y superación personal como pilares." },
];

const categories = [
  { icon: Sparkles, label: "Sub-8 Semillero" },
  { icon: Activity, label: "Sub-12 Formación" },
  { icon: Trophy, label: "Sub-15 Liga" },
  { icon: Users, label: "Femenino Juvenil" },
];

export default function Home() {
  return (
    <MarketingLayout>
      <HomeHero />

      {/* Categorías y Programas */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Programas Formativos"
            title="Formación integral para todas las edades"
            lead="Desde la iniciación psicomotriz hasta el alto rendimiento en ligas oficiales de fútbol."
          />
        </Reveal>
        <div className="mt-14">
          <ServiceGrid services={featuredServices} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/servicios" variant="outline">
            Ver todas las categorías y servicios
          </CtaLink>
        </div>
      </Section>

      {/* Presentación de la Sede */}
      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Nuestra Sede" title="Más de una década formando jóvenes campeones" center={false} />
        </Reveal>
        <div className="mt-12">
          <PhotoFeatureStack
            image="/gallery/pet-7.jpg"
            imageAlt="Entrenador guiando a niños en cancha de fútbol"
            features={[
              { title: "Canchas con iluminación LED", text: "Terrenos de césped sintético y natural habilitados para entrenamientos diurnos y nocturnos." },
              { title: "Acompañamiento físico y médico", text: "Seguimiento antropométrico, fisioterapia preventiva y planes de nutrición." },
              { title: "Sede Bogotá Cantera", text: "Calle 170 #15-30, Bogotá. Lunes a sábados de 6:00 a 20:00." },
            ]}
          />
        </div>
        <div className="mt-8 flex justify-center lg:justify-start">
          <CtaLink href="/nosotros" variant="outline" size="sm">
            Conocer nuestra sede y filosofía
          </CtaLink>
        </div>
      </Section>

      {/* Por qué elegirnos */}
      <Section className="pb-0">
        <Reveal>
          <SectionHeading
            eyebrow="Diferenciales Cantera"
            title="Cuatro razones por las que los padres confían en nuestra escuela"
          />
        </Reveal>
      </Section>
      <IconFeatureFloatCard items={whyUs} />

      {/* Cuerpo Técnico */}
      <Section dark>
        <Reveal>
          <SectionHeading
            eyebrow="Cuerpo Técnico"
            title="Profesionales apasionados por la formación"
            lead="Directores técnicos, preparadores físicos y coordinadores dedicados al desarrollo de tu hijo."
            dark
          />
        </Reveal>
        <div className="mt-14">
          <VetGrid team={team} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/equipo" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Conocer a todos los entrenadores
            <ArrowRight className="size-4" />
          </CtaLink>
        </div>
      </Section>

      {/* Alto Rendimiento */}
      <OffsetBlobBlock
        eyebrow="Preparación Integral"
        title="Formación técnica, táctica y física de nivel"
        image="/gallery/paw-procedure.jpg"
        imageAlt="Entrenamiento de velocidad y agilidad con conos"
        actions={
          <CtaLink href="/servicios/sub-15-torneo-liga" variant="outline" size="sm">
            Ver programa competitivo
          </CtaLink>
        }
      >
        <p className="text-lg leading-8 text-muted-foreground">
          Nuestra metodología propia estructura el desarrollo del atleta respetando su madurez biológica, alternando
          ejercicios de técnica individual con esquemas tácticos de alta competencia.
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6">
          {[
            "Ficha deportiva digital e historial de asistencia en el ERP",
            "Evaluaciones nutricionales y test de resistencia periódicos",
            "Participación garantizada en torneos oficiales y copas locales",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </OffsetBlobBlock>

      {/* Estadísticas */}
      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      {/* Testimonios */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Testimonios" title="Lo que expresan los padres y acudientes" />
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

      {/* Categorías Formativas */}
      <Section className="relative isolate overflow-hidden">
        <GradientBlob className="-right-24 -bottom-24 size-[110%] opacity-30" />
        <Reveal>
          <SectionHeading eyebrow="Nuestras Ramas" title="Divisiones diseñadas para cada etapa del crecimiento" />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-x-4 gap-y-10 rounded-[2.5rem] bg-card p-8 shadow-elevation-4 sm:grid-cols-4 sm:p-12">
            {categories.map((item) => (
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
          <SectionHeading eyebrow="Preguntas Frecuentes" title="Dudas habituales antes de inscribir a tu hijo" />
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

      {/* CTA Agendar Clase Gratis */}
      <AppointmentCta />

      {/* Ubicación */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">Visítanos</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Te esperamos en nuestra sede deportiva
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Calle 170 #15-30, Bogotá. Lunes a sábados de 6:00 a 20:00.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/contacto" variant="outline">
                Ir a contacto
              </CtaLink>
              <CtaLink
                href="https://www.google.com/maps/search/?api=1&query=Calle+170+%2315-30%2C+Bogot%C3%A1"
                variant="ghost"
              >
                Ver en el mapa
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
                title="Ubicación de Escuela de Fútbol La Cantera en Google Maps"
                className="size-full"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
