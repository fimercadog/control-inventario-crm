import { Star } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import type { Testimonial } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function TestimonialCard({ testimonial, delay = 0 }: { testimonial: Testimonial; delay?: number }) {
  return (
    // Aparicion secuencial con desplazamiento corto (duration mas larga que el
    // resto: se "asienta" con calma) + sombra que decanta junto con la opacidad.
    <Reveal delay={delay} duration={0.7} className="transition-shadow shadow-elevation-2">
      <figure className="flex h-full flex-col border-l-4 border-cta/70 pl-5">
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} de 5 estrellas`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("size-4", i < testimonial.rating ? "fill-chart-3 text-chart-3" : "text-border")}
            />
          ))}
        </div>
        <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground/85">“{testimonial.text}”</blockquote>
        <figcaption className="mt-5">
          <p className="text-sm font-bold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.treatment}</p>
          {/* Contenido de ejemplo (demo), no testimonios reales de clientes --
              reemplazar por reseñas reales antes de vender/desplegar. */}
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Testimonio de ejemplo
          </p>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export function TestimonialGrid({ testimonials, limit }: { testimonials: Testimonial[]; limit?: number }) {
  const items = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <TestimonialCard key={t.name} testimonial={t} delay={(i % 3) * 0.12} />
      ))}
    </div>
  );
}
