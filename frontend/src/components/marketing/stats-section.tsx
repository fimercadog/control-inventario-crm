import { Reveal } from "@/components/marketing/reveal";
import type { Stat } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function StatsSection({ stats, dark = false }: { stats: Stat[]; dark?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.06}>
          <div className="text-center">
            <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{stat.value}</p>
            <p
              className={cn(
                "mt-1.5 text-xs font-medium uppercase tracking-wide sm:text-sm",
                dark ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {stat.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
