import Image from "next/image";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { Reveal } from "@/components/marketing/reveal";
import { container } from "@/components/marketing/page-hero";
import { cn } from "@/lib/utils";

/**
 * Bloque asimétrico: blob de color con título+CTA superpuesto a la izquierda,
 * foto grande desplazada a la derecha -- patrón "Our Mission & Vision" de
 * About en el pack Divi. No es un grid centrado, es deliberadamente
 * descentrado/editorial.
 */
export function OffsetBlobBlock({
  eyebrow,
  title,
  children,
  actions,
  image,
  imageAlt,
  reverse = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-28">
      <div className={container}>
        <div className={cn("relative grid items-center gap-10 lg:grid-cols-2", reverse && "lg:[&>*:first-child]:order-2")}>
          <div className="relative z-10 flex min-h-64 items-center">
            {/* Blob: escala muy suave, arranca antes que el texto (planta el
                fondo primero). Texto: slide-up con calma, un poco despues. */}
            <Reveal direction="zoom-in" duration={0.8} className="pointer-events-none absolute -inset-y-16 -left-10 -z-10 size-[160%]">
              <GradientBlob className="inset-0 opacity-90" warm float />
            </Reveal>
            <Reveal delay={0.15} className="relative z-10 max-w-sm px-6 py-10 sm:px-10">
              {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">{eyebrow}</p>}
              <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">{title}</h2>
              {children}
              {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
            </Reveal>
          </div>
          <Reveal direction="fade" duration={0.8} delay={0.2} className="relative z-10">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] shadow-elevation-4 sm:ml-auto sm:max-w-md">
              <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
