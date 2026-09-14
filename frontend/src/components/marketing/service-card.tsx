import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cardHover } from "@/components/marketing/marketing-ui";
import type { Service } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const Icon = service.icon;
  return (
    <Reveal delay={delay}>
      <Link
        href={`/servicios/${service.slug}`}
        className={cn("group flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}
      >
        <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5.5" />
        </span>
        <h3 className="mt-5 text-base font-bold">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{service.short}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Ver más
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </Reveal>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, i) => (
        <ServiceCard key={service.slug} service={service} delay={(i % 3) * 0.06} />
      ))}
    </div>
  );
}
