import type { LucideIcon } from "lucide-react";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { cn } from "@/lib/utils";

/**
 * Panel decorativo (gradiente teal/ambar + icono) para los lugares donde va
 * una fotografia real de la clinica. No hay capacidad de generacion de
 * imagenes en este entorno, asi que en vez de un <img> roto se usa una
 * composicion propia del sistema de diseño — coherente y sin depender de
 * fotos de stock adivinadas. Reemplazar por fotografia real de la clinica
 * cuando este disponible (ver los mismos puntos de uso: home, nosotros,
 * equipo).
 */
export function PhotoPlaceholder({
  icon: Icon,
  label,
  warm = false,
  className,
}: {
  icon: LucideIcon;
  label?: string;
  warm?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate flex items-center justify-center overflow-hidden bg-secondary", className)}>
      <GradientBlob className="left-[-25%] top-[-30%] size-[85%] opacity-50" warm={warm} float />
      <GradientBlob className="right-[-30%] bottom-[-30%] size-[75%] opacity-35" warm={!warm} />
      <div className="relative flex flex-col items-center gap-3 px-4 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-card/80 text-primary shadow-elevation-2 backdrop-blur">
          <Icon className="size-7" />
        </span>
        {label ? <span className="text-xs font-semibold text-foreground/70">{label}</span> : null}
      </div>
    </div>
  );
}

const AVATAR_HUES = ["bg-primary", "bg-chart-3", "bg-chart-5"] as const;

function hueForName(name: string) {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_HUES[sum % AVATAR_HUES.length];
}

/** Avatar de iniciales para el equipo — sin depender de una foto real. */
export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(Dr\.|Dra\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center text-primary-foreground",
        hueForName(name),
        className,
      )}
      aria-hidden
    >
      <span className="text-3xl font-black tracking-tight sm:text-4xl">{initials}</span>
    </div>
  );
}
