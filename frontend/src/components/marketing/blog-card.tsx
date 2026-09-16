import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cardHover } from "@/components/marketing/marketing-ui";
import type { BlogPost } from "@/components/marketing/marketing-data";
import { teamBySlug } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

/** Tarjeta con foto para el listado del blog. */
export function BlogCard({ post, delay = 0 }: { post: BlogPost; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/blog/${post.slug}`}
        className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card", cardHover)}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-elevation-1">
            {post.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {post.readMinutes} min
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Leer artículo <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/** Artículo destacado — bloque grande al tope del listado, imagen protagonista. */
export function FeaturedPost({ post }: { post: BlogPost }) {
  const author = teamBySlug(post.authorSlug);
  return (
    <Reveal>
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "group grid overflow-hidden rounded-3xl border border-border bg-card shadow-elevation-2 lg:grid-cols-2",
          cardHover,
        )}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden lg:aspect-auto">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <span className="w-fit rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Destacado · {post.category}
          </span>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{post.title}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            {author && <span className="font-semibold text-foreground">{author.name}</span>}
            <span>· {formatDate(post.date)}</span>
            <span>· {post.readMinutes} min</span>
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
