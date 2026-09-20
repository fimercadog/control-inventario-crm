import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import type { Service } from "@/components/marketing/marketing-data";

/** Ícono por servicio para Agencia de Viajes. */
export const SERVICE_ICON: Record<string, string> = {
  "paquetes-turisticos": "/gallery/icons/icon-1.png",
  "tiquetes-aereos": "/gallery/icons/icon-2.png",
  "hoteles-alojamiento": "/gallery/icons/icon-3.png",
  "tours-guiados": "/gallery/icons/icon-4.png",
  "seguro-viajero": "/gallery/icons/icon-5.png",
  "cruceros-experiencias": "/gallery/icons/icon-6.png",
};

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const iconSrc = SERVICE_ICON[service.slug];
  return (
    <Reveal delay={delay}>
      <Link href={`/servicios/${service.slug}`} className="group flex h-full flex-col">
        {iconSrc ? (
          <Image src={iconSrc} alt="" width={56} height={56} className="size-14" />
        ) : (
          <span className="grid size-14 place-items-center rounded-xl bg-secondary">
            <service.icon className="size-6 text-primary" />
          </span>
        )}
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

/** Misma tarjeta blanca flotante sin bordes por ítem que IconFeatureFloatCard -- consistencia con "All Vet Services". */
export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="rounded-[2.5rem] bg-card p-8 shadow-elevation-4 sm:p-12">
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.slug} service={service} delay={0.08 + (i % 3) * 0.08} />
        ))}
      </div>
    </div>
  );
}
