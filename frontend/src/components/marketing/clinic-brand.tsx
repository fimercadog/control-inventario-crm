import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Identidad del sitio público: ERP PyME & CRM Multi-Servicios.
 */
export const CLINIC_NAME = "ERP PyME Core";
export const CLINIC_SHORT_NAME = "ERP PyME";

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="size-4.5" />
      </span>
      <span className="text-base font-extrabold leading-tight tracking-tight">
        ERP<span className="text-primary">.PyME</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Gestión & CRM Core
        </span>
      </span>
    </Link>
  );
}
