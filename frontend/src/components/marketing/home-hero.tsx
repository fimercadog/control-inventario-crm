import Image from "next/image";
import { CtaLink } from "@/components/marketing/cta-link";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";
import { Reveal } from "@/components/marketing/reveal";

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
        {/* Foto: fade + zoom muy suave (arranca en 1.05x y se asienta) --
            arranca primero, todo lo demas entra encima despues. */}
        <Reveal mount direction="zoom-out" duration={1.1} className="absolute inset-0">
          <Image
            src="/gallery/hero-bulldog-exam.jpg"
            alt="Veterinario examinando a un bulldog en la camilla de consulta"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>
        {/* Overlay calido (no navy/frio): el hero real usa un duotono tostado/beige
            sobre la foto, no un scrim oscuro -- getComputedStyle confirmo texto
            blanco encima de ese tono calido, no de negro. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#241a13]/80 via-[#3d2f26]/40 to-[#3d2f26]/5" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Reveal mount delay={0.25}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">CareNote · Atención Domiciliaria</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Menos tiempo escribiendo. <br />
                <span className="text-primary">Más tiempo cuidando.</span>
              </h1>
            </Reveal>
            <Reveal mount delay={0.38}>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
                Plataforma de atención domiciliaria para enfermeras y terapeutas. Captura notas clínicas por Telegram con voz o texto, automatiza reportes e informes y gestiona a tus pacientes sin esfuerzo.
              </p>
            </Reveal>
            {/* Botones con stagger -- entran despues del texto, uno tras otro. */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Reveal mount delay={0.52}>
                <CtaLink href="/login" variant="cta">
                  Probar CareNote
                </CtaLink>
              </Reveal>
              <Reveal mount delay={0.62}>
                <CtaLink
                  href="/servicios"
                  variant="default"
                  className="shadow-[0_12px_30px_-6px_rgb(0_0_0/0.45)]"
                >
                  Ver cómo funciona
                </CtaLink>
              </Reveal>
            </div>

          </div>
        </div>
      </div>

      {/* Tarjeta flotante: ultimo elemento en entrar, "se apoya" sobre el hero
          una vez que ya esta todo asentado (choreografia propia adentro). */}
      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <FloatingContactCard mount delay={0.72} />
      </div>
    </section>
  );
}
