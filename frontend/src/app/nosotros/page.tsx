import { Sparkles, ShieldCheck, Zap } from "lucide-react";
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
  { icon: Sparkles, title: "Enfoque Antiaging Real", text: "Estimulación celular y prevención activa desde los primeros signos de envejecimiento cutáneo." },
  { icon: Zap, title: "Tecnología Avanzada", text: "Aparatología médica de vanguardia y microagujamiento de alta precisión." },
  { icon: ShieldCheck, title: "Insumos Certificados", text: "Laboratorios internacionales de primer nivel con registro de seguridad INVIMA y FDA." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Nosotros"
        title="Medicina Estética de precisión en una clínica médica exclusiva"
        lead="Clínica Estética & Medicina Antiaging Élite nació para brindar tratamientos médicos estéticos de máxima calidad con un enfoque natural, seguro y personalizado."
        image="/gallery/aesthetic/hero_aesthetic.jpg"
        imageAlt="Médica especialista en medicina estética"
        actions={
          <>
            <CtaLink href="/equipo" variant="cta">
              Conocer al equipo médico
            </CtaLink>
            <CtaLink href={WHATSAPP_URL} variant="outline">
              Escribir por WhatsApp
            </CtaLink>
          </>
        }
      />

      <Section className="pb-0">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {values.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                  <Icon className="size-6" />
                </span>
                <p className="mt-4 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-cta">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section>
        <PhotoFeatureStack
          image="/gallery/aesthetic/cabina_clinica.jpg"
          imageAlt="Cabina médica de valoración estética"
          features={[
            { title: "Más de una década de trayectoria", text: "Evolucionamos de un consultorio estético boutique a un centro médico de rejuvenecimiento avanzado." },
            { title: "Consultas sin afanes", text: "Cada valoración tiene el tiempo necesario para diagnosticar y planificar minuciosamente tu tratamiento." },
            { title: "Atención continuada", text: "Seguimiento médico personalizado y control fotográfico post-procedimiento en cada sesión." },
          ]}
        />
      </Section>

      <OffsetBlobBlock
        title="Nuestra misión y valores médicos"
        image="/gallery/aesthetic/rejuvenecimiento_facial.jpg"
        imageAlt="Sesión de rejuvenecimiento dérmico con tecnología médica"
        actions={
          <CtaLink href="/servicios" variant="cta">
            Ver catálogo de tratamientos
          </CtaLink>
        }
      >
        <ul className="mt-2 space-y-3 text-sm leading-6">
          <li>
            <strong className="font-bold">Naturalidad ante todo.</strong> Potenciamos tus rasgos propios sin alterar tu expresión ni crear volúmenes excesivos.
          </li>
          <li>
            <strong className="font-bold">Práctica médica ética.</strong> Transparencia total en presupuestos, marcas de insumos y consentimiento informado.
          </li>
          <li>
            <strong className="font-bold">Bioseguridad & Calidad.</strong> Protocolos médicos quirúrgicos estrictos y ficha digital de cada procedimiento.
          </li>
        </ul>
      </OffsetBlobBlock>

      <Section className="pt-0">
        <Reveal>
          <div className={`${container} max-w-3xl space-y-5 text-base leading-8 text-muted-foreground`}>
            <p>
              Clínica Estética & Medicina Antiaging Élite nació con una premisa clara: devolverle a la medicina estética su rigor científico y su sensibilidad artística. Entendemos que cada rostro cuenta una historia única y que el rejuvenecimiento efectivo respeta la anatomía individual.
            </p>
            <p>
              A lo largo de más de 12 años, hemos consolidado un equipo de médicos especialistas en armonización facial, dermatología estética y nutrición cellular antiaging, garantizando que cada paciente reciba una atención privada, ética y respaldada por productos de prestigio internacional.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Equipo Médico" title="Nuestros Especialistas" center={false} />
        </Reveal>
        <div className="mt-12">
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
