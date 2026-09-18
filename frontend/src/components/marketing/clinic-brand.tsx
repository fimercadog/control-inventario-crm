import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

/** Identidad del sitio público: CareNote - Atención Domiciliaria. */
export const CLINIC_NAME = "CareNote - Atención Domiciliaria";
export const CLINIC_SHORT_NAME = "CareNote";

export function ClinicWordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${CLINIC_NAME} — inicio`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Stethoscope className="size-4.5" />
      </span>
      <span className="text-base font-extrabold leading-tight tracking-tight">
        CareNote
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Atención Domiciliaria
        </span>
      </span>
    </Link>
  );
}

