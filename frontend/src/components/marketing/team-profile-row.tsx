import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import type { TeamMember } from "@/components/marketing/marketing-data";

/**
 * Fila apilada foto-bleed-izquierda + card blanca superpuesta a la derecha para el equipo médico.
 */
export function TeamProfileRow({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <div className="sm:grid sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center sm:gap-0">
      {/* Foto aparece primero (escala suave); la card de texto entra lateral
          desde la derecha justo despues, como si se apoyara en la foto. */}
      <Reveal direction="zoom-in" delay={delay}>
        <InitialsAvatar name={member.name} className="aspect-4/5 w-full rounded-2xl shadow-elevation-3" />
      </Reveal>
      {/* max-w para que la card NO estire hasta el borde del contenedor --
          si no, lee como una barra de dashboard, no una card flotante. */}
      <Reveal
        direction="right"
        delay={delay + 0.12}
        className="relative z-10 -mt-6 max-w-xl rounded-2xl bg-card p-7 shadow-elevation-4 sm:-ml-14 sm:mt-0"
      >
        <h3 className="text-2xl font-extrabold tracking-tight">{member.name}</h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-chart-4">{member.role}</p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{member.longBio}</p>
        <Link href={`/equipo/${member.slug}`} className="mt-4 inline-block text-sm font-bold text-cta hover:underline">
          {member.specialty}
        </Link>
      </Reveal>
    </div>
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
