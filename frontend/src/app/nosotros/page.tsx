import Image from "next/image";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { container } from "@/components/marketing/page-hero";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { stats, team } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { OffsetBlobBlock } from "@/components/marketing/offset-blob-block";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { SplitHero } from "@/components/marketing/split-hero";
import { StatsSection } from "@/components/marketing/stats-section";
import { TeamProfileList } from "@/components/marketing/team-profile-row";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

const values = [
  { icon: "/gallery/icons/icon-9.png", title: "Metodología Formativa", text: "Procesos técnicos y físicos estructurados según la etapa biológica del joven atleta." },
  { icon: "/gallery/icons/icon-14.png", title: "Sede Deportiva Propia", text: "Canchas sintéticas e iluminación profesional para entrenamientos y partidos de liga." },
  { icon: "/gallery/icons/icon-13.png", title: "Seguimiento ERP Cantera", text: "Ficha deportiva digital, control de asistencia e integración con cartera y mensualidades." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Nosotros"
        title="Más de una década formando jóvenes talentos y personas íntegras"
        lead="Escuela de Fútbol La Cantera nació con el propósito de formar atletas competitivos con principios éticos, trabajo en equipo y proyección deportiva profesional."
        image="/gallery/illustrations/illustration-2.png"
        imageAlt="Entrenador guiando a niños en cancha de fútbol"
        actions={
          <>
            <CtaLink href="/equipo" variant="cta">
              Conocer al cuerpo técnico
            </CtaLink>
            <CtaLink href={WHATSAPP_URL} variant="outline">
              Contacto por WhatsApp
            </CtaLink>
          </>
        }
      />

      <Section className="pb-0">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {values.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <Image src={item.icon} alt="" width={56} height={56} className="size-14" />
              <p className="mt-4 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-chart-4">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <PhotoFeatureStack
          image="/gallery/pet-7.jpg"
          imageAlt="Entrenadores en sesión táctica de fútbol"
          features={[
            { title: "Trayectoria de Excelencia", text: "Empezamos como una escuela comunitaria; hoy contamos con 450+ deportistas activos en torneos de liga." },
            { title: "Atención y Formación Personalizada", text: "Grupos reducidos por categoría para garantizar el desarrollo técnico de cada alumno." },
            { title: "Cuerpo Técnico Certificado", text: "Directores técnicos y preparadores físicos con licencias de la Federación Colombiana de Fútbol." },
          ]}
        />
      </Section>

      <OffsetBlobBlock
        title="Nuestra misión y valores"
        image="/gallery/pet-8.jpg"
        imageAlt="Jugadores de cantera celebrando en equipo"
        actions={
          <CtaLink href="/servicios" variant="cta">
            Ver programas y categorías
          </CtaLink>
        }
      >
        <ul className="mt-2 space-y-3 text-sm leading-6">
          <li>
            <strong className="font-bold">Disciplina y Trabajo en Equipo.</strong> Fomentamos el respeto, la solidaridad y la superación personal en cada entrenamiento.
          </li>
          <li>
            <strong className="font-bold">Formación Responsable.</strong> Cuidado de la salud física y acompañamiento nutricional para prevenir lesiones.
          </li>
          <li>
            <strong className="font-bold">Gestión Digital ERP.</strong> Transparencia en inscripciones, pagos y seguimiento de asistencia para los padres de familia.
          </li>
        </ul>
      </OffsetBlobBlock>

      <Section className="pt-0">
        <Reveal>
          <div className={`${container} max-w-3xl space-y-5 text-base leading-8 text-muted-foreground`}>
            <p>
              En Escuela de Fútbol La Cantera estamos convencidos de que el deporte es el mejor vehículo para la transformación social y el desarrollo humano. Nuestro compromiso es brindar herramientas deportivas de alto nivel en un ambiente seguro y motivador.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Cuerpo Técnico" title="Profesionales al frente de cada categoría" />
        </Reveal>
        <div className="mt-12">
          <TeamProfileList team={team} />
        </div>
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
