import Image from "next/image";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { Reveal } from "@/components/marketing/reveal";

export const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/**
 * Visual del hero de home: fotografía real (pack Divi "Veterinarian",
 * licenciado — ver docs/referencia-visual.md) con las mismas tarjetas
 * flotantes de confianza que antes, ahora sobre la foto en vez de la
 * ilustración de blobs.
 */
function HeroArt() {
  return (
    <div className="relative flex aspect-4/5 w-full items-center justify-center overflow-hidden rounded-4xl border border-border bg-secondary shadow-elevation-4 sm:aspect-5/4.6 lg:aspect-4/4.6">
      <Image
        src="/gallery/hero-bulldog-exam.jpg"
        alt="Veterinario revisando a un bulldog en la camilla de consulta"
        fill
        priority
        sizes="(min-width: 1024px) 40vw, 90vw"
        className="object-cover"
      />

      <div className="absolute left-6 top-8 flex items-center gap-2 rounded-2xl bg-card/90 px-4 py-3 shadow-elevation-2 backdrop-blur sm:left-10 sm:top-12">
        <ShieldCheck className="size-4.5 shrink-0 text-primary" />
        <div className="leading-tight">
          <p className="text-sm font-extrabold">12+ años</p>
          <p className="text-[11px] text-muted-foreground">de trayectoria</p>
        </div>
      </div>

      <div className="absolute bottom-8 right-6 flex items-center gap-2 rounded-2xl bg-card/90 px-4 py-3 shadow-elevation-2 backdrop-blur sm:bottom-12 sm:right-10">
        <HeartPulse className="size-4.5 shrink-0 text-chart-3" />
        <div className="leading-tight">
          <p className="text-sm font-extrabold">3.500+</p>
          <p className="text-[11px] text-muted-foreground">mascotas atendidas</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero de pagina: eyebrow chico, titulo grande, texto y acciones en pastilla.
 * `visual="art"` agrega la composicion de arriba a la derecha (home); `"none"`
 * centra el texto sin visual lateral (paginas internas). Fondo ambient
 * compartido via `HeroBackdrop`.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  badge,
  actions,
  note,
  visual = "none",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  note?: string;
  visual?: "art" | "none";
}) {
  const hasVisual = visual === "art";

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />
      <div
        className={`${container} grid items-center gap-10 sm:gap-12 ${
          hasVisual ? "py-12 sm:py-16 lg:py-24 lg:grid-cols-[1fr_1.05fr]" : "py-12 sm:py-14 lg:py-20"
        }`}
      >
        <div className={hasVisual ? undefined : "mx-auto max-w-3xl text-center"}>
          {badge && (
            <Reveal mount>
              <div className={hasVisual ? "mb-6" : "mb-6 flex justify-center"}>{badge}</div>
            </Reveal>
          )}
          {eyebrow && (
            <Reveal mount delay={0.05}>
              <p className="font-heading text-xs font-extrabold uppercase tracking-[0.22em] text-cta">{eyebrow}</p>
            </Reveal>
          )}
          <Reveal mount delay={0.1}>
            <h1 className="mt-3 text-[2.05rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          {lead && (
            <Reveal mount delay={0.18}>
              <p
                className={`mt-5 text-base leading-7 text-foreground/72 sm:mt-6 sm:text-lg sm:leading-8 ${
                  hasVisual ? "max-w-lg" : "mx-auto max-w-2xl"
                }`}
              >
                {lead}
              </p>
            </Reveal>
          )}
          {actions && (
            <Reveal mount delay={0.26}>
              <div className={`mt-8 flex flex-wrap gap-3 ${hasVisual ? "" : "justify-center"}`}>{actions}</div>
            </Reveal>
          )}
          {note && (
            <Reveal mount delay={0.34}>
              <p className="mt-6 text-xs text-muted-foreground">{note}</p>
            </Reveal>
          )}
        </div>

        {hasVisual && (
          <Reveal mount zoom delay={0.2}>
            <HeroArt />
          </Reveal>
        )}
      </div>
    </section>
  );
}
