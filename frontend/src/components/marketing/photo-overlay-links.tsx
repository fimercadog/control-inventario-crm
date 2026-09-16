import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { container } from "@/components/marketing/page-hero";

type LinkItem = { label: string; href: string };

/**
 * Foto full-bleed con duotono azul + titulo blanco + columnas de links en
 * texto plano -- patron "Other Services" de Services en el pack Divi (no un
 * grid de icon-cards, es una lista de texto sobre foto).
 */
export function PhotoOverlayLinks({
  title,
  image,
  imageAlt,
  items,
  columns = 3,
}: {
  title: string;
  image: string;
  imageAlt: string;
  items: LinkItem[];
  columns?: 2 | 3;
}) {
  const perCol = Math.ceil(items.length / columns);
  const cols = Array.from({ length: columns }, (_, i) => items.slice(i * perCol, (i + 1) * perCol));

  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0">
        <Image src={image} alt={imageAlt} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-chart-4/70" />
      </div>
      <div className={`${container} relative z-10`}>
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
        </Reveal>
        <div className="mt-10 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {cols.map((col, ci) => (
            <ul key={ci} className="space-y-4">
              {col.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm font-semibold text-white/90 hover:text-white hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
