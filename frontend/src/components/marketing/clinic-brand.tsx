import Link from "next/link";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Identidad del sitio público: Escuela de Fútbol & Cantera Deportiva.
 */
export const CLINIC_NAME = "Escuela de Fútbol La Cantera";
export const CLINIC_SHORT_NAME = "La Cantera";

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Trophy className="size-4.5" />
      </span>
      <span className="text-base font-extrabold leading-tight tracking-tight">
        La Cantera<span className="text-primary">.FC</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Escuela de Fútbol
        </span>
      </span>
    </Link>
  );
}
