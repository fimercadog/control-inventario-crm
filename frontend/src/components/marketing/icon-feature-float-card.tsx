import Image from "next/image";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { Reveal } from "@/components/marketing/reveal";
import { container } from "@/components/marketing/page-hero";

type Item = { icon: string; title: string; text: string; href?: string };

/**
 * Grilla de íconos SIN bordes/sombra individual, contenida en una única
 * tarjeta blanca flotante sobre un fondo con blob orgánico -- patrón "All Vet
 * Services" del pack Divi. A propósito no usa `cardHover`/bordes por ítem:
 * la tarjeta grande es el único contenedor visual.
 */
export function IconFeatureFloatCard({ items }: { items: Item[] }) {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20">
      <GradientBlob className="-bottom-32 -left-20 size-[90%] opacity-45" warm float />
      <div className={container}>
        <Reveal>
          <div className="grid gap-x-10 gap-y-12 rounded-[2.5rem] bg-card p-8 shadow-elevation-4 sm:grid-cols-2 sm:p-12 lg:grid-cols-3">
            {items.map((item, i) => {
              const Wrapper = item.href ? "a" : "div";
              return (
                <Reveal key={item.title} delay={0.1 + (i % 3) * 0.08}>
                  <Wrapper
                    {...(item.href ? { href: item.href } : {})}
                    className={item.href ? "group block" : undefined}
                  >
                    <Image src={item.icon} alt="" width={56} height={56} className="size-14" />
                    {/* Azul secundario, no navy -- getComputedStyle exacto del titulo de
                        icono ("Mauris Blandit" etc, color rgb(43,135,218)) en el live-demo. */}
                    <p
                      className={`mt-4 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-chart-4 ${item.href ? "group-hover:underline" : ""}`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </Wrapper>
                </Reveal>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
