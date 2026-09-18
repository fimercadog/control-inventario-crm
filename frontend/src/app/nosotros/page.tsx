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
  { icon: "/gallery/icons/icon-9.png", title: "Dictado por Telegram", text: "Dictá audios naturales al terminar o durante cada atención domiciliaria." },
  { icon: "/gallery/icons/icon-14.png", title: "Estructuración con IA", text: "Procesamiento automático de voz a informe clínico organizado." },
  { icon: "/gallery/icons/icon-13.png", title: "Expediente unificado", text: "Historial completo de atenciones y consentimientos por paciente." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Sobre CareNote"
        title="Tecnología de atención domiciliaria pensada para profesionales de la salud"
        lead="CareNote nació para liberar a enfermeros y terapeutas de horas de redacción manual nocturna, permitiendo capturar atenciones por voz en Telegram y generar informes clínicos estructurados al instante."
        image="/gallery/illustrations/illustration-2.png"
        imageAlt="Profesional de atención domiciliaria registrando datos de salud"
        actions={
          <>
            <CtaLink href="/equipo" variant="cta">
              Conocer al equipo
            </CtaLink>
            <CtaLink href={WHATSAPP_URL} variant="outline">
              Escribinos por WhatsApp
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
          imageAlt="Enfermera domiciliaria realizando valoración clínica"
          features={[
            { title: "Pensado para el desplazamiento", text: "Diseñado para profesionales que atienden pacientes en casa y necesitan registrar datos rápidamente." },
            { title: "Múltiples audios por sesión", text: "El límite es por audio individual, no por sesión. Mantené el contexto durante visitas largas." },
            { title: "Control administrativo completo", text: "Revisá informes, gestioná pacientes y exportá datos desde el panel web de CareNote." },
          ]}
        />
      </Section>

      <OffsetBlobBlock
        title="Misión y principios"
        image="/gallery/pet-8.jpg"
        imageAlt="Registro de evolución clínica en pantalla"
        actions={
          <CtaLink href="/servicios" variant="cta">
            Ver soluciones
          </CtaLink>
        }
      >
        <ul className="mt-2 space-y-3 text-sm leading-6">
          <li>
            <strong className="font-bold">Menos tiempo administrativo.</strong> Liberá tu tiempo para enfocarlo en el cuidado del paciente.
          </li>
          <li>
            <strong className="font-bold">Registros precisos.</strong> Transcripciones estructuradas de constante vital y evolución clínica.
          </li>
          <li>
            <strong className="font-bold">Privacidad y seguridad.</strong> Datos protegidos bajo estándares de seguridad y consentimiento informado.
          </li>
        </ul>
      </OffsetBlobBlock>

      <Section className="pt-0">
        <Reveal>
          <div className={`${container} max-w-3xl space-y-5 text-base leading-8 text-muted-foreground`}>
            <p>
              CareNote fue creado como la respuesta a la sobrecarga administrativa que enfrentan los profesionales de atención domiciliaria en enfermería, fisioterapia, terapia respiratoria y ocupacional.
            </p>
            <p>
              Integrando el bot de Telegram con flujos avanzados de n8n e Inteligencia Artificial, CareNote transforma audios de voz en notas de atención profesionales, listas para ser radicadas o revisadas.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Liderazgo" title="El equipo detrás de CareNote" center={false} />
        </Reveal>
        <div className="mt-14">
          <TeamProfileList team={team} />
        </div>
      </Section>

      <Section dark>
        <StatsSection stats={stats} dark />
      </Section>

      <AppointmentCta />
    </MarketingLayout>
  );
}
