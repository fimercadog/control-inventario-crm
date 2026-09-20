import Link from "next/link";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Identidad del sitio público: Viajes Globales — Agencia de Viajes & Turismo.
 */
export const CLINIC_NAME = "Viajes Globales";
export const CLINIC_SHORT_NAME = "Viajes Globales";

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
        <Plane className="size-4.5" />
      </span>
      <span className="text-base font-extrabold leading-tight tracking-tight">
        Viajes<span className="text-sky-600">.Globales</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Agencia de Viajes & Turismo
        </span>
      </span>
    </Link>
  );
}
