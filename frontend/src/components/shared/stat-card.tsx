import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "success" | "warning" | "destructive";

const TONE_CLASSNAMES: Record<StatCardTone, string> = {
  "chart-1": "bg-(--chart-1)/12 text-(--chart-1)",
  "chart-2": "bg-(--chart-2)/12 text-(--chart-2)",
  "chart-3": "bg-(--chart-3)/12 text-(--chart-3)",
  "chart-4": "bg-(--chart-4)/12 text-(--chart-4)",
  "chart-5": "bg-(--chart-5)/12 text-(--chart-5)",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
};

const TOP_BORDER_CLASSNAMES: Record<StatCardTone, string> = {
  "chart-1": "bg-(--chart-1)",
  "chart-2": "bg-(--chart-2)",
  "chart-3": "bg-(--chart-3)",
  "chart-4": "bg-(--chart-4)",
  "chart-5": "bg-(--chart-5)",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

interface StatCardProps {
  label: string;
  value: string | number;
  tone?: StatCardTone;
}

// Shared with the dashboard's chart card headers — the tinted icon square is
// what makes the stat cards read as "designed" rather than plain boxes, so
// the chart cards borrow the same piece instead of looking flatter.
export function IconBadge({ icon: Icon, tone = "chart-1", className }: { icon: LucideIcon; tone?: StatCardTone; className?: string }) {
  return (
    <div
      className={cn(
        "ring-current/20 flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset",
        TONE_CLASSNAMES[tone],
        className,
      )}
    >
      <Icon className="size-5" />
    </div>
  );
}

// Small rate/percentage pill for a chart header — e.g. "18% conversión a
// cierre". Reuses the same tone-tinted-pill treatment as the icon badge so it
// reads as part of the same design language instead of a bolted-on label.
export function RateBadge({ label, value, tone = "chart-1" }: { label: string; value: string; tone?: StatCardTone }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", TONE_CLASSNAMES[tone])}>
      <strong className="font-semibold">{value}</strong> {label}
    </span>
  );
}

// A generic accent-blue stripe on every card reads as one undifferentiated
// wall of numbers — a distinct tone per metric lets the eye group and scan
// them, same idea as the dashboard's colored charts. Top-border-strip style
// (no icon) to match the reference BI-dashboard look this page copies.
export function StatCard({ label, value, tone = "chart-1" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div className={cn("absolute inset-x-0 top-0 h-0.75", TOP_BORDER_CLASSNAMES[tone])} />
      <CardContent className="flex flex-col gap-1">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
