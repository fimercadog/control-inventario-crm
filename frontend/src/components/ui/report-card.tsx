"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/lib/use-count-up";

export const REPORT_TONES = {
  indigo: "#4f46e5",
  sky: "#0284c7",
  emerald: "#10b981",
  green: "#0e8f5c",
  amber: "#b9770e",
  rose: "#e11d48",
  violet: "#7c3aed",
  slate: "#64748b",
  cyan: "#06b6d4",
  orange: "#ea580c",
};

export const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function ReportIconBadge({ tone, size = 10, children }: { tone: string; size?: 9 | 10 | 11; children: React.ReactNode }) {
  const cls = size === 9 ? "size-9" : size === 11 ? "size-11" : "size-10";
  return (
    <span
      className={`grid ${cls} shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-current/15`}
      style={{ backgroundColor: `${tone}1f`, color: tone }}
    >
      {children}
    </span>
  );
}

export function ReportAnimatedValue({ value, isMoney = false, prefix = "$", suffix = "" }: { value: number; isMoney?: boolean; prefix?: string; suffix?: string }) {
  const v = useCountUp(value);
  const formatted = Math.round(v).toLocaleString("es-CO");
  return (
    <span className="tabular-nums">
      {isMoney ? `${prefix}${formatted}` : formatted}
      {suffix}
    </span>
  );
}

export function ReportKpiCard({
  label,
  value,
  isMoney = false,
  suffix = "",
  icon: Icon,
  tone = REPORT_TONES.indigo,
  hint,
  emphasis = false,
}: {
  label: string;
  value: number;
  isMoney?: boolean;
  suffix?: string;
  icon: LucideIcon;
  tone?: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden border-border/70 transition-all duration-200 hover:shadow-md ${
        emphasis ? "ring-1 ring-primary/25 shadow-[0_0_0_1px_rgba(99,102,241,0.06),0_8px_30px_-12px_rgba(99,102,241,0.25)]" : ""
      }`}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-lg" style={{ backgroundColor: tone }} />
      {emphasis ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: tone }}
        />
      ) : null}
      <CardContent className="flex items-start justify-between gap-3 p-4 pt-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-2 font-bold tracking-tight ${emphasis ? "text-3xl text-foreground" : "text-2xl text-foreground"}`}>
            <ReportAnimatedValue value={value} isMoney={isMoney} suffix={suffix} />
          </p>
          {hint ? <p className="mt-1.5 truncate text-xs font-medium text-muted-foreground">{hint}</p> : null}
        </div>
        <ReportIconBadge tone={tone} size={emphasis ? 11 : 10}>
          <Icon className="size-5" />
        </ReportIconBadge>
      </CardContent>
    </Card>
  );
}

export function ReportSectionHeader({ title, description, icon: Icon, tone = REPORT_TONES.indigo }: { title: string; description?: string; icon?: LucideIcon; tone?: string }) {
  return (
    <div className="flex items-center gap-3">
      {Icon ? (
        <ReportIconBadge tone={tone} size={9}>
          <Icon className="size-4.5" />
        </ReportIconBadge>
      ) : null}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

export function ReportChartFrame({
  title,
  description,
  icon: Icon,
  tone = REPORT_TONES.indigo,
  children,
  action,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden border-border/70 shadow-elevation-1">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-lg" style={{ backgroundColor: tone }} />
      <CardContent className="p-5 pt-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <ReportIconBadge tone={tone} size={9}>
              <Icon className="size-4" />
            </ReportIconBadge>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
              {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function ReportDistributionCard({
  title,
  description,
  icon: Icon,
  tone = REPORT_TONES.indigo,
  rows,
  isMoney = false,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: string;
  rows: { name: string; value: number }[];
  isMoney?: boolean;
}) {
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
  return (
    <ReportChartFrame title={title} description={description} icon={Icon} tone={tone}>
      <div className="space-y-3.5 pt-1">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-xs font-medium text-muted-foreground">Sin registros suficientes para análisis.</p>
        ) : (
          rows.map((row) => {
            const pct = Math.round((row.value / total) * 100);
            return (
              <div key={row.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="truncate text-foreground font-semibold">{row.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {isMoney ? `$${row.value.toLocaleString("es-CO")}` : row.value.toLocaleString("es-CO")}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: tone }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </ReportChartFrame>
  );
}
