import Image from "next/image";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type Feature = { title: string; text: string };

/**
 * Foto grande a un lado + 2-3 tarjetas blancas flotantes apiladas,
 * superpuestas sobre el borde de la foto (patrón del pack Divi
 * "Veterinarian": bloque de foto grande con cards de feature encimadas, no
 * un grid de tarjetas parejas).
 */
export function PhotoFeatureStack({
  image,
  imageAlt,
  features,
  reverse = false,
}: {
  image: string;
  imageAlt: string;
  features: Feature[];
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-y-8 lg:grid-cols-2 lg:gap-x-0">
      <Reveal className={cn("relative aspect-4/5 w-full overflow-hidden rounded-3xl shadow-elevation-3 sm:aspect-16/10 lg:aspect-4/5", reverse && "lg:order-2")}>
        <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </Reveal>
      <div className={cn("relative z-10 space-y-5 lg:-mx-10", reverse ? "lg:order-1 lg:pr-10" : "lg:pl-10")}>
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="rounded-2xl bg-card p-6 shadow-elevation-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{f.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
