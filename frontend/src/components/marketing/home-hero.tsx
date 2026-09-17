import Image from "next/image";
import { CtaLink } from "@/components/marketing/cta-link";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";
import { Reveal } from "@/components/marketing/reveal";
import { IPS_CONFIG } from "@/lib/ips-config";

/**
 * Hero Principal de Demo IPS.
 * Presenta fotografía photorealista de recepción médica, llamada a la acción clara para agendamiento de citas
 * y servicios asistenciales con lenguaje regulatorio neutro.
 */
export function HomeHero() {
  return (
    <section className="relative isolate">
      <div className="relative h-[620px] w-full overflow-hidden sm:h-[700px] lg:h-[780px]">
        <Reveal mount direction="zoom-out" duration={1.1} className="absolute inset-0">
          <Image
            src="/gallery/ips/hero_ips.jpg"
            alt="Recepción y equipo médico de Demo IPS en instalaciones de atención integral"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>

        {/* Overlay Navy / Sky médico para alto contraste editorial */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Reveal mount delay={0.25}>
              <span className="inline-block rounded-md bg-sky-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.22em] text-sky-300 backdrop-blur-md">
                {IPS_CONFIG.brand.descriptor}
              </span>
              <h1 className="mt-4 text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Demo <span className="text-sky-400">IPS</span>
              </h1>
            </Reveal>

            <Reveal mount delay={0.38}>
              <p className="mt-5 text-xl font-medium leading-relaxed text-slate-200">
                {IPS_CONFIG.brand.tagline}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Consulta Externa · Pediatría · Atención Prioritaria · Laboratorio Clínico · Especialidades
              </p>
            </Reveal>

            <div className="mt-9 flex flex-wrap gap-4">
              <Reveal mount delay={0.52}>
                <CtaLink href="/agendar-cita" variant="cta" className="bg-sky-600 px-7 py-3.5 text-base font-bold text-white hover:bg-sky-700">
                  Agendar Cita Médica
                </CtaLink>
              </Reveal>

              <Reveal mount delay={0.62}>
                <CtaLink
                  href="/servicios"
                  variant="default"
                  className="bg-slate-900/90 px-7 py-3.5 text-base font-semibold text-white shadow-xl hover:bg-slate-800"
                >
                  Ver Especialidades
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
