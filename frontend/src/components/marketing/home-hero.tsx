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
        {/* Overlay calido (no navy/frio): el hero real usa un duotono tostado/beige
            sobre la foto, no un scrim oscuro -- getComputedStyle confirmo texto
            blanco encima de ese tono calido, no de negro. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#241a13]/80 via-[#3d2f26]/40 to-[#3d2f26]/5" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">Clínica veterinaria</p>
            <h1 className="mt-4 text-6xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
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
              {/* Pastilla navy solida -- estilo real de "View All Services" del hero del
                  live-demo (modulo de texto con fondo navy, no el naranja de .et_pb_button). */}
              <CtaLink
                href="/servicios"
                variant="default"
                className="shadow-[0_12px_30px_-6px_rgb(0_0_0/0.45)]"
              >
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
