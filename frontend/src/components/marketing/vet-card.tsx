import Link from "next/link";
import { UserCheck } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import type { TeamMember } from "@/components/marketing/marketing-data";

export function VetCard({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/equipo/${member.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <InitialsAvatar name={member.name} className="aspect-4/3 w-full bg-slate-100 dark:bg-slate-800" />
        <div className="p-6">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sky-600">
            <UserCheck className="size-3.5" /> {member.role}
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{member.name}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{member.specialty}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{member.bio}</p>
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
