import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { team, teamBySlug } from "@/components/marketing/marketing-data";
import { InitialsAvatar } from "@/components/marketing/photo-placeholder";
import { Reveal } from "@/components/marketing/reveal";

export function generateStaticParams() {
  return team.map((t) => ({ slug: t.slug }));
}

export default async function TeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = teamBySlug(slug);
  if (!member) notFound();

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Link href="/equipo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Equipo
        </Link>

        <Reveal>
          <div className="mt-8 grid gap-10 sm:grid-cols-[220px_1fr] sm:items-start">
            <InitialsAvatar
              name={member.name}
              className="aspect-4/5 w-full overflow-hidden rounded-3xl shadow-elevation-2"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{member.role}</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{member.name}</h1>
              <p className="mt-3 text-sm font-semibold text-muted-foreground">{member.specialty}</p>
              <p className="mt-6 text-base leading-7 text-foreground/85">{member.longBio}</p>
            </div>
          </div>
        </Reveal>
      </article>

      <AppointmentCta />
    </MarketingLayout>
  );
}
