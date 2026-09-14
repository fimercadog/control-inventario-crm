import { Star } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import type { Testimonial } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function TestimonialCard({ testimonial, delay = 0 }: { testimonial: Testimonial; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} de 5 estrellas`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("size-4", i < testimonial.rating ? "fill-chart-3 text-chart-3" : "text-border")}
            />
          ))}
        </div>
        <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground/85">“{testimonial.text}”</blockquote>
        <figcaption className="mt-5 border-t border-border pt-4">
          <p className="text-sm font-bold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.pet}</p>
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
        <TestimonialCard key={t.name} testimonial={t} delay={(i % 3) * 0.08} />
      ))}
    </div>
  );
}
