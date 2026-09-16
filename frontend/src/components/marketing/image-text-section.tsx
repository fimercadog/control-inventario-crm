import Image from "next/image";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

/**
 * Bloque foto + texto alternado (imagen protagonista de un lado, contenido del
 * otro). Reemplaza el patrón que se repetía a mano en cada página con
 * PhotoPlaceholder/<img> sueltos — ahora un solo componente compartido.
 */
export function ImageTextSection({
  image,
  imageAlt,
  eyebrow,
  title,
  reverse = false,
  children,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: React.ReactNode;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <Reveal className={cn(reverse && "lg:order-2")}>
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl shadow-elevation-3">
          <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
        </div>
      </Reveal>
      <Reveal delay={0.1} className={cn(reverse && "lg:order-1")}>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        <div className="mt-4 text-lg leading-8 text-muted-foreground">{children}</div>
      </Reveal>
    </div>
  );
}
