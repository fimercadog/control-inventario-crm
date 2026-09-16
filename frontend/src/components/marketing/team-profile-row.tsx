import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import type { TeamMember } from "@/components/marketing/marketing-data";

/**
 * Fila apilada foto-bleed-izquierda + card blanca superpuesta a la derecha --
 * patron "Highly Trained Veterinarians" de About en el pack Divi (no un grid
 * de cards parejas). Sin fotografia real del staff se usa InitialsAvatar
 * (ver photo-placeholder.tsx) en vez de una foto de stock adivinada.
 */
export function TeamProfileRow({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="sm:grid sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center sm:gap-0">
        <InitialsAvatar name={member.name} className="aspect-4/5 w-full rounded-2xl shadow-elevation-3" />
        {/* max-w para que la card NO estire hasta el borde del contenedor --
            si no, lee como una barra de dashboard, no una card flotante. */}
        <div className="relative z-10 -mt-6 max-w-xl rounded-2xl bg-card p-7 shadow-elevation-4 sm:-ml-14 sm:mt-0">
          <h3 className="text-2xl font-extrabold tracking-tight">{member.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-chart-4">{member.role}</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{member.longBio}</p>
          <Link href={`/equipo/${member.slug}`} className="mt-4 inline-block text-sm font-bold text-cta hover:underline">
            {member.specialty}
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function TeamProfileList({ team }: { team: TeamMember[] }) {
  return (
    <div className="space-y-10">
      {team.map((member, i) => (
        <TeamProfileRow key={member.slug} member={member} delay={i * 0.08} />
      ))}
    </div>
  );
}
