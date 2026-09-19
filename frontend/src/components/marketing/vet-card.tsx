import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import type { TeamMember } from "@/components/marketing/marketing-data";

export function TeamCard({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/equipo/${member.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-elevation-3 transition-shadow hover:shadow-elevation-4"
      >
        <InitialsAvatar name={member.name} className="aspect-4/5 w-full" />
        <div className="p-5">
          <h3 className="text-base font-bold">{member.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cta">{member.role}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{member.bio}</p>
        </div>
      </Link>
    </Reveal>
  );
}

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member, i) => (
        <TeamCard key={member.slug} member={member} delay={i * 0.08} />
      ))}
    </div>
  );
}

export const VetCard = TeamCard;
export const VetGrid = TeamGrid;
