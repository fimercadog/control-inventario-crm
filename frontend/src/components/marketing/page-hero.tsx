import { DeviceMockup } from "@/components/marketing/device-mockup";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { Reveal } from "@/components/marketing/reveal";
import { WidgetCluster } from "@/components/marketing/widget-card";

export const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/**
 * Divi "SaaS Product" hero: tiny eyebrow, a huge black headline, grey body,
 * small green pill actions, and — on the right — either a floating widget
 * cluster (home) or a product screenshot tilted in perspective.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  badge,
  actions,
  note,
  visual = "cluster",
  screenshot,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  note?: string;
  visual?: "cluster" | "screenshot" | "none";
  screenshot?: { src: string; alt: string };
}) {
  const hasVisual = visual !== "none";

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />
      <div
        className={`${container} grid items-center gap-12 py-16 lg:py-24 ${
          hasVisual ? "lg:grid-cols-[1fr_1.1fr]" : ""
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
            </Reveal>
          )}
          <Reveal mount delay={0.1}>
            <h1 className="mt-3 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">{title}</h1>
          </Reveal>
          {lead && (
            <Reveal mount delay={0.18}>
              <p
                className={`mt-6 text-lg leading-8 text-muted-foreground ${
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

        {visual === "cluster" && (
          <Reveal mount delay={0.2}>
            <WidgetCluster />
          </Reveal>
        )}
        {visual === "screenshot" && screenshot && (
          <Reveal mount zoom delay={0.2}>
            <div className="relative">
              <GradientBlob className="right-[-8%] top-[-10%] size-[70%]" float />
              <DeviceMockup src={screenshot.src} alt={screenshot.alt} tilt="right" />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
