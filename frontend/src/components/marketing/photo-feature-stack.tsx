import Image from "next/image";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type Feature = { title: string; text: string };

/**
 * Foto grande + 2-3 tarjetas angostas flotantes MONTADAS SOBRE el borde de
 * la foto (no una columna que ocupa la mitad del ancho, alineada al lado --
 * eso lee como una barra de dashboard, no como el patrón real del pack:
 * foto protagonista ~55-60% + cards de ancho fijo (`max-w-sm`) que invaden
 * el borde de la foto con margen negativo real, dejando aire de página a su
 * lado. Medido por pixel sobre el live-demo de About: las cards ocupan
 * ~510px de 1280 de contenido, superpuestas ~55px sobre la foto).
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
    <div
      className={cn(
        "lg:grid lg:items-center lg:gap-0",
        reverse ? "lg:grid-cols-[1fr_1.4fr]" : "lg:grid-cols-[1.4fr_1fr]",
      )}
    >
      <Reveal
        className={cn(
          "relative aspect-4/5 w-full overflow-hidden rounded-3xl shadow-elevation-3 sm:aspect-16/10 lg:aspect-4/5",
          reverse ? "lg:order-2" : "lg:order-1",
        )}
      >
        <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
      </Reveal>
      <div
        className={cn(
          // Mobile: las cards trepan sobre el borde inferior de la foto (mismo
          // idioma que FloatingContactCard en los heroes), no un stack aparte.
          "relative z-10 -mt-16 mx-4 space-y-4 sm:mx-8 lg:mx-0 lg:mt-0 lg:max-w-sm lg:space-y-5",
          reverse ? "lg:order-1 lg:-mr-20 lg:justify-self-end" : "lg:order-2 lg:-ml-20",
        )}
      >
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="rounded-2xl bg-card p-6 shadow-elevation-4">
              {/* Titulos de card en azul secundario, no navy -- getComputedStyle exacto
                  del live-demo ("Vivamus Suscipit Tortor" etc, color rgb(43,135,218)). */}
              <p className="font-heading text-xs font-extrabold uppercase tracking-[0.18em] text-chart-4">{f.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
