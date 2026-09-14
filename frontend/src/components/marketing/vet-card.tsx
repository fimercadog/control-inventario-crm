import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { cardHover } from "@/components/marketing/marketing-ui";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import type { TeamMember } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function VetCard({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/equipo/${member.slug}`}
        className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card", cardHover)}
      >
        <InitialsAvatar name={member.name} className="aspect-4/5 w-full" />
        <div className="p-5">
          <h3 className="text-base font-bold">{member.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{member.role}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{member.bio}</p>
        </div>
      </Link>
    </Reveal>
  );
}

export function VetGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member, i) => (
        <VetCard key={member.slug} member={member} delay={i * 0.08} />
      ))}
    </div>
  );
}
