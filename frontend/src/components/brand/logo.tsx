import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-8 [&>svg]:size-4",
  md: "size-9 [&>svg]:size-5",
  lg: "size-11 [&>svg]:size-6",
  xl: "size-14 [&>svg]:size-7",
};

/** Marca: huella verde sobre cuadrado oscuro. Coincide con el favicon y el header. */
export function LogoMark({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl bg-ink text-primary", sizes[size], className)}>
      <PawPrint />
    </span>
  );
}

export function Logo({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="text-base font-black tracking-tight text-foreground">
        Vet<span className="text-primary">·</span>Panel
      </span>
    </span>
  );
}
