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
import { StatsSection } from "@/components/marketing/stats-section";
import { TeamProfileList } from "@/components/marketing/team-profile-row";

const values = [
  { icon: "/gallery/icons/icon-9.png", title: "Medicina preventiva real", text: "No esperamos a que algo duela: vacunación y chequeos programados desde la primera visita." },
  { icon: "/gallery/icons/icon-14.png", title: "Quirófano propio", text: "Cirugías de rutina y de tejidos blandos sin derivar el caso a otra clínica." },
  { icon: "/gallery/icons/icon-13.png", title: "Diagnóstico el mismo día", text: "Laboratorio propio para no hacerte esperar un resultado externo." },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero: foto full-bleed lavada (blanco) + texto encima -- patrón "About DiviVet" del pack. */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/gallery/pet-12.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "62% 50%" }}
          />
          <div className="absolute inset-0 bg-background/88" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal mount>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">Nosotros</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Una clínica de barrio, con el equipamiento de una grande
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Clínica Veterinaria Los Andes nació para que cada mascota tenga un equipo veterinario que la
                conozca de verdad, visita tras visita — no una cara distinta cada vez.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tira de 3 iconos plana, sin tarjeta flotante -- a diferencia del grid de
          "All Vet Services" de Services, el de About va directo sobre blanco. */}
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
          imageAlt="Veterinario del equipo revisando a un bulldog en consulta"
          features={[
            { title: "Más de una década", text: "Empezamos como una consulta pequeña de barrio; hoy tenemos consultorios equipados, laboratorio propio y quirófano." },
            { title: "Pocas mascotas, no muchas apuradas", text: "Cada consulta tiene el tiempo que necesita, y cada historia clínica queda registrada." },
            { title: "El mismo equipo siempre", text: "Conocemos a cada paciente por su nombre y a cada propietario por el suyo." },
          ]}
        />
      </Section>

      <OffsetBlobBlock
        title="Nuestra misión y valores"
        image="/gallery/pet-8.jpg"
        imageAlt="Procedimiento veterinario con instrumental de precisión"
        actions={
          <CtaLink href="/servicios" variant="cta">
            Ver servicios
          </CtaLink>
        }
      >
        <ul className="mt-2 space-y-3 text-sm leading-6">
          <li>
            <strong className="font-bold">Trato cercano.</strong> Explicamos cada diagnóstico con tiempo, no de
            pasada.
          </li>
          <li>
            <strong className="font-bold">Medicina responsable.</strong> Ningún procedimiento sin explicar el
            porqué ni presupuesto previo.
          </li>
          <li>
            <strong className="font-bold">Mejora continua.</strong> Historia clínica digital y laboratorio propio.
          </li>
        </ul>
      </OffsetBlobBlock>

      {/* Parrafo ancho de storytelling -- patron "quienes somos" de About en el
          pack (bloque de texto grande, no una lista de bullets). */}
      <Section className="pt-0">
        <Reveal>
          <div className={`${container} max-w-3xl space-y-5 text-base leading-8 text-muted-foreground`}>
            <p>
              Clínica Veterinaria Los Andes empezó como un consultorio pequeño de barrio, con un solo veterinario
              y una sala de espera compartida con la recepción. Más de una década después, seguimos en el mismo
              barrio — pero con consultorios equipados, laboratorio propio y quirófano, sin haber perdido de vista
              lo que nos trajo hasta acá: conocer a cada mascota por su nombre.
            </p>
            <p>
              Esa cercanía es una decisión, no un accidente de tamaño. Trabajamos con veterinarios de planta, no
              rotativos, y con historia clínica digital por paciente, para que cada visita — sea un control de
              rutina o una urgencia — parta de lo que ya sabemos de tu mascota, no de cero.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Equipo -- mismo patron "Highly Trained Veterinarians" de About: fila
          apilada foto+card, no un grid de tarjetas parejas (ver Equipo para el
          listado completo con bios). */}
      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="Profesionales" title="El equipo detrás de cada consulta" center={false} />
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
