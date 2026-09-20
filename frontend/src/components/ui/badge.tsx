import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300",
        variant === "secondary" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        variant === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
        variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
        variant === "destructive" && "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300",
        variant === "outline" && "border border-border text-foreground",
        className,
      )}
      {...props}
    />
  );
}
