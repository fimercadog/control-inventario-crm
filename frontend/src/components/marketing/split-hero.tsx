import Image from "next/image";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { Reveal } from "@/components/marketing/reveal";
import { container } from "@/components/marketing/page-hero";

/**
 * Hero texto-izquierda + ilustración/foto-derecha sobre fondo con blobs
 * orgánicos — patrón de "Services"/"Landing" del pack Divi (distinto del
 * hero de foto full-bleed de Home).
 */
export function SplitHero({
  eyebrow,
  title,
  lead,
  actions,
  image,
  imageAlt,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  actions?: React.ReactNode;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <GradientBlob className="-right-24 -top-24 size-[130%] opacity-40" />
      <div className={`${container} grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:py-24`}>
        <Reveal mount>
          <div className="max-w-lg">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
            <h1 className="mt-3 text-[2.05rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              {title}
            </h1>
            {lead && <p className="mt-5 text-base leading-7 text-foreground/72 sm:mt-6 sm:text-lg sm:leading-8">{lead}</p>}
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </Reveal>
        <Reveal mount zoom delay={0.15}>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-contain" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
