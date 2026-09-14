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
      {eyebrow && (
        <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", dark ? "text-chart-3" : "text-primary")}>
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-8", dark ? "text-white/70" : "text-muted-foreground")}>{lead}</p>
      )}
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className={cn("group flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}>
      <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
