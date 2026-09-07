import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Paid add-on" marker for the AI module — a navy pill with a bright amber
 * PREMIUM chip so it reads as an upgrade tier, not a footnote.
 */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-navy py-1.5 pl-1.5 pr-4 text-xs text-navy-foreground shadow-elevation-2",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 font-bold uppercase tracking-wide text-navy">
        <Sparkles className="size-3" />
        Premium
      </span>
      <span className="font-medium text-navy-foreground/90">Interfaz lista · sin proveedor conectado</span>
    </span>
  );
}
