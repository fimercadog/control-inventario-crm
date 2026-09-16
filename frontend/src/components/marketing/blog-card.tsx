import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
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

/** Artículo destacado — bloque grande al tope del listado, imagen protagonista, sin recuadro de card. */
export function FeaturedPost({ post }: { post: BlogPost }) {
  const author = teamBySlug(post.authorSlug);
  return (
    <Reveal>
      <Link href={`/blog/${post.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-elevation-3">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Destacado · {post.category}</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            {author && <span className="font-semibold text-foreground">{author.name}</span>}
            <span>· {formatDate(post.date)}</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Leer artículo completo <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export { formatDate };
