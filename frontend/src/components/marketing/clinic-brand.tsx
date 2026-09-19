import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Identidad del sitio público: la CLÍNICA ("Élite Estética"), no el software.
 * Branding elegante, premium y profesional especializado en estética y medicina antiaging.
 */
export const CLINIC_NAME = "Clínica Estética & Medicina Antiaging Élite";
export const CLINIC_SHORT_NAME = "Élite Estética";

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
        <Sparkles className="size-4.5" />
      </span>
      <span className="text-base font-extrabold leading-tight tracking-tight">
        Élite Estética
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          Medicina Estética & Antiaging
        </span>
      </span>
    </Link>
  );
}
