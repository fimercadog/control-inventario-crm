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
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1920"
            alt="Viajeros disfrutando de unas vacaciones en la playa y explorando destinos internacionales"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Reveal mount delay={0.25}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-400">Agencia de Viajes & Turismo</p>
              <h1 className="mt-4 text-6xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
                Viajes Globales
              </h1>
            </Reveal>
            <Reveal mount delay={0.38}>
              <p className="mt-6 max-w-md text-lg leading-8 text-slate-200">
                Descubre el mundo con itinerarios inolvidables, reservas de vuelos, hoteles de lujo y paquetes vacacionales a tu medida.
              </p>
            </Reveal>
            <div className="mt-9 flex flex-wrap gap-3">
              <Reveal mount delay={0.52}>
                <CtaLink href="/contacto" variant="cta">
                  Planear mi viaje
                </CtaLink>
              </Reveal>
              <Reveal mount delay={0.62}>
                <CtaLink href="/servicios" variant="default" className="bg-sky-600 text-white hover:bg-sky-500">
                  Ver paquetes turísticos
                </CtaLink>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
      <FloatingContactCard />
    </section>
  );
}
