import Link from "next/link";
import { Hospital } from "lucide-react";
import { IPS_CONFIG } from "@/lib/ips-config";
import { cn } from "@/lib/utils";

/**
 * Identidad pública de la IPS: Demo IPS.
 */
export const CLINIC_NAME = IPS_CONFIG.brand.name;
export const CLINIC_SHORT_NAME = IPS_CONFIG.brand.shortName;

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
        <Hospital className="size-5" />
      </span>
      <span className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
        Demo<span className="text-sky-600">.IPS</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Institución Prestadora de Salud
        </span>
      </span>
    </Link>
  );
}
