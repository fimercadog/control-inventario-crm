import { container } from "@/components/marketing/page-hero";
import { cn } from "@/lib/utils";

export { container };

export const cardHover = "transition-colors duration-200 hover:border-primary/50 hover:shadow-elevation-2";

export function Section({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(dark && "bg-ink text-ink-foreground", "py-20 lg:py-28", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = true,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {/* Nunito 800/14px/uppercase/tracking-2px, getComputedStyle exacto del
          eyebrow "Services" del live-demo (color naranja en la mayoria de
          secciones; en dark queda blanco/70 por contraste). */}
      {eyebrow && (
        <p className={cn("font-heading text-sm font-extrabold uppercase tracking-[0.14em]", dark ? "text-white/70" : "text-cta")}>
          {eyebrow}
        </p>
      )}
      {/* 42px/700 real, extraido de "What We Do" del live-demo via getComputedStyle. */}
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.625rem]">{title}</h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-8", dark ? "text-white/70" : "text-muted-foreground")}>{lead}</p>
      )}
    </div>
  );
}
