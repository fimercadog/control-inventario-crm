import Image from "next/image";
import { CtaLink } from "@/components/marketing/cta-link";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";
import { Reveal } from "@/components/marketing/reveal";

export function HomeHero() {
  return (
    <section className="relative isolate">
      <div className="relative h-[600px] w-full overflow-hidden sm:h-[680px] lg:h-[760px]">
        <Reveal mount direction="zoom-out" duration={1.1} className="absolute inset-0">
          <Image
            src="/gallery/aesthetic/hero_aesthetic.jpg"
            alt="Médica especialista en valoración de medicina estética y rejuvenecimiento facial"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1917]/85 via-[#292524]/50 to-[#292524]/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Reveal mount delay={0.25}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Medicina Estética & Antiaging</p>
              <h1 className="mt-4 text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Élite Estética
              </h1>
            </Reveal>
            <Reveal mount delay={0.38}>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/90">
                Armonización facial, toxina botulínica, ácido hialurónico y bioestimulación de colágeno con médicos especialistas y resultados 100% naturales.
              </p>
            </Reveal>
            <div className="mt-9 flex flex-wrap gap-3">
              <Reveal mount delay={0.52}>
                <CtaLink href="/agendar-cita" variant="cta">
                  Agendar Valoración
                </CtaLink>
              </Reveal>
              <Reveal mount delay={0.62}>
                <CtaLink
                  href="/servicios"
                  variant="default"
                  className="shadow-[0_12px_30px_-6px_rgb(0_0_0/0.45)]"
                >
                  Ver todos los tratamientos
                </CtaLink>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <FloatingContactCard mount delay={0.72} />
      </div>
    </section>
  );
}
