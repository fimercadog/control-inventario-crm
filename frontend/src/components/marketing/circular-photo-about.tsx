import Image from "next/image";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

/**
 * Foto circular con halo de color detrás (offset), + texto al lado --
 * patrón "About [Service]" de Service Detail en el pack Divi.
 */
export function CircularPhotoAbout({
  image,
  imageAlt,
  eyebrow,
  title,
  children,
  haloClassName = "bg-cta/30",
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  haloClassName?: string;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      {/* El circulo aparece con una escala muy suave (foto protagonista);
          el texto entra con calma un poco despues. */}
      <Reveal direction="zoom-in" duration={0.7} className="relative mx-auto aspect-square w-full max-w-sm">
        <div className={cn("absolute -inset-4 rounded-full", haloClassName)} aria-hidden />
        <div className="relative size-full overflow-hidden rounded-full shadow-elevation-3">
          <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
        </div>
      </Reveal>
      <Reveal direction="fade" delay={0.2}>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        <div className="mt-4 text-lg leading-8 text-muted-foreground">{children}</div>
      </Reveal>
    </div>
  );
}
