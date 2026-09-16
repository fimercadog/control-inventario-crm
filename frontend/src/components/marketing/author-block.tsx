import Link from "next/link";
import type { TeamMember } from "@/components/marketing/marketing-data";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";

/** Bloque de autor — quién escribe/revisa el artículo, con link a su perfil de /equipo. */
export function AuthorBlock({ author }: { author: TeamMember }) {
  return (
    <Link
      href={`/equipo/${author.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <InitialsAvatar name={author.name} className="size-14 shrink-0 rounded-full" />
      <div className="min-w-0">
        <p className="text-sm font-bold group-hover:text-primary">{author.name}</p>
        <p className="text-xs text-muted-foreground">{author.role}</p>
      </div>
    </Link>
  );
}
