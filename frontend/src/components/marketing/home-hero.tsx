import Image from "next/image";
import { CtaLink } from "@/components/marketing/cta-link";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";

/**
 * Hero de Home al estilo del pack Divi "Veterinarian": foto full-bleed con
 * degradé oscuro para legibilidad, wordmark grande, dos botones píldora, y
 * una tarjeta de contacto flotante superpuesta sobre el borde inferior de la
 * foto (mismo patrón que la referencia: bloque blanco "Contact Us Anytime,
 * 7 days a Week" montado sobre el hero).
 */
export function HomeHero() {
  return (
    <section className="relative isolate">
      <div className="relative h-[600px] w-full overflow-hidden sm:h-[680px] lg:h-[760px]">
        <Image
          src="/gallery/paw-procedure.jpg"
          alt="Veterinario atendiendo la pata de un paciente en consulta"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/55 to-ink/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">Clínica veterinaria</p>
            <h1 className="mt-4 text-6xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Los Andes
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
              Cuidado veterinario cercano, de la consulta a la urgencia — un mismo equipo que conoce a tu mascota
              desde la primera visita.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href="/agendar-cita" variant="cta">
                Agendar cita
              </CtaLink>
              <CtaLink href="/servicios" variant="outline" className="border-white bg-white/95 text-ink hover:bg-white">
                Ver todos los servicios
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <FloatingContactCard />
      </div>
    </section>
  );
}
