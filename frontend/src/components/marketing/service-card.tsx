import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cardHover } from "@/components/marketing/marketing-ui";
import type { Service } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

/** Ícono ilustrado del pack Divi "Veterinarian" por servicio (ver docs/referencia-visual-veterinaria.md). */
export const SERVICE_ICON: Record<string, string> = {
  "consulta-veterinaria": "/gallery/icons/icon-16.png",
  vacunacion: "/gallery/icons/icon-9.png",
  desparasitacion: "/gallery/icons/icon-10.png",
  "medicina-preventiva": "/gallery/icons/icon-1.png",
  "laboratorio-clinico": "/gallery/icons/icon-13.png",
  cirugia: "/gallery/icons/icon-14.png",
  "odontologia-veterinaria": "/gallery/icons/icon-15.png",
  hospitalizacion: "/gallery/icons/icon-12.png",
  urgencias: "/gallery/icons/icon-2.png",
  nutricion: "/gallery/icons/icon-4.png",
  "diagnostico-por-imagen": "/gallery/icons/icon-14.png",
  "peluqueria-grooming": "/gallery/icons/icon-8.png",
};

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const iconSrc = SERVICE_ICON[service.slug];
  return (
    <Reveal delay={delay}>
      <Link
        href={`/servicios/${service.slug}`}
        className={cn("group flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}
      >
        <span className="grid size-14 place-items-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={32} height={32} className="size-8" />
          ) : (
            <service.icon className="size-5.5 text-primary" />
          )}
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
