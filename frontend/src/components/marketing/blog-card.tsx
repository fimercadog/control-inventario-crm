import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import type { BlogPost } from "@/components/marketing/marketing-data";
import { teamBySlug } from "@/components/marketing/marketing-data";

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Tarjeta editorial para el listado del blog -- sin borde/sombra de "card
 * SaaS": foto grande sin recuadro, categoría/fecha como texto plano arriba
 * del título (no badge), igual al Veterinarian Blog real del pack.
 */
export function BlogCard({ post, delay = 0 }: { post: BlogPost; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-chart-4">
          {formatDate(post.date)} · {post.category}
        </p>
        <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-tight group-hover:text-primary">{post.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Leer artículo <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </Reveal>
  );
}

/**
 * Artículo destacado -- tarjeta blanca centrada solo texto (sin foto), botón
 * píldora "Leer más" -- patrón real del slide destacado de Blog en el pack
 * Divi (el original es un carrusel; con un solo destacado no hace falta el
 * slider, se resuelve como una tarjeta fija).
 */
export function FeaturedPost({ post }: { post: BlogPost }) {
  const author = teamBySlug(post.authorSlug);
  return (
    // Fade + escala muy leve (0.97->1), sin desplazamiento -- lee como una
    // portada que "decanta", distinto del sube-y-aparece de las cards chicas.
    <Reveal direction="zoom-in" duration={0.7}>
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-card px-6 py-14 text-center shadow-elevation-4 sm:px-16">
        <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{post.title}</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          {author && <span className="font-semibold text-foreground">{author.name}</span>} · {formatDate(post.date)} ·{" "}
          <span className="text-chart-4">{post.category}</span>
        </p>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-7">
          <CtaLink href={`/blog/${post.slug}`} variant="cta">
            Leer más
          </CtaLink>
        </div>
      </div>
    </Reveal>
  );
}

export { formatDate };
