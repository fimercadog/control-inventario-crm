import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-8 [&>svg]:size-4",
  md: "size-9 [&>svg]:size-5",
  lg: "size-11 [&>svg]:size-6",
  xl: "size-14 [&>svg]:size-7",
};

/** Marca: avión sobre cuadrado oscuro. Coincide con la identidad de Agencia de Viajes. */
export function LogoMark({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sky-400 dark:bg-slate-800", sizes[size], className)}>
      <Plane />
    </span>
  );
}

export function Logo({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="text-base font-black tracking-tight text-foreground">
        Viajes<span className="text-sky-500">·</span>Globales
      </span>
    </span>
  );
}
