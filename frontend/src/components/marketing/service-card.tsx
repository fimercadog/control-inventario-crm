import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import type { Service } from "@/components/marketing/marketing-data";

export const SERVICE_ICON: Record<string, string> = {
  "consulta-medica-general": "/gallery/icons/icon-16.png",
  "pediatria-neonatologia": "/gallery/icons/icon-9.png",
  "laboratorio-clinico": "/gallery/icons/icon-13.png",
  "urgencias-triage": "/gallery/icons/icon-2.png",
  "cardiologia-ekg": "/gallery/icons/icon-1.png",
  "imagenes-diagnosticas": "/gallery/icons/icon-14.png",
  "odontologia-integral": "/gallery/icons/icon-15.png",
  "fisioterapia-rehabilitacion": "/gallery/icons/icon-8.png",
};

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const iconSrc = SERVICE_ICON[service.slug];
  return (
    <Reveal delay={delay}>
      <Link href={`/servicios/${service.slug}`} className="group flex h-full flex-col">
        {iconSrc ? (
          <Image src={iconSrc} alt="" width={56} height={56} className="size-14" />
        ) : (
          <span className="grid size-14 place-items-center rounded-xl bg-sky-50 dark:bg-sky-950">
            <service.icon className="size-6 text-sky-600" />
          </span>
        )}
        <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-slate-100">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{service.short}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-600">
          Ver detalles
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </Reveal>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-md sm:p-12 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.slug} service={service} delay={0.08 + (i % 3) * 0.08} />
        ))}
      </div>
    </div>
  );
}
