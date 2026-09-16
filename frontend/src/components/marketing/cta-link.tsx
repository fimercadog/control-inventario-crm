"use client";

import Link from "next/link";
import { useRipple } from "@/components/marketing/ripple";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "secondary" | "cta";
type Size = "sm" | "default";

// Boton real del pack Divi (extraido via getComputedStyle del live-demo):
// Nunito, peso 800, uppercase, letter-spacing 1px, pastilla completa.
const base =
  "relative max-w-full overflow-hidden inline-flex items-center justify-center text-center rounded-full font-heading font-extrabold uppercase tracking-[0.05em] transition-colors duration-150 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// min-h en vez de h fija: una etiqueta larga en una pantalla angosta envuelve a
// dos lineas dentro de la pastilla en vez de desbordar y quedar cortada.
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 py-1.5 text-sm gap-1.5",
  default: "min-h-11 px-6 py-2.5 text-sm gap-2",
};

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary-hover",
  outline: "border-2 border-current hover:bg-primary hover:border-primary hover:text-primary-foreground",
  ghost: "hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  // Ambar calido: reservado para las dos acciones de maxima prioridad del
  // sitio (Agendar cita / WhatsApp), para que destaquen por encima del teal.
  // Sombra tintada al color del boton -- mismo patron que el boton real del
  // pack Divi (rgba(255,112,0,.32) 0 12px 18px -6px).
  cta: "bg-cta text-cta-foreground shadow-[0_12px_18px_-6px_rgb(255_112_0_/_0.32)] hover:bg-cta-hover",
};

/**
 * Divi-style pill CTA. Filled teal by default; `cta` es el ambar de maxima
 * prioridad. Outline es un anillo de 2px en el color de texto actual. Touch
 * ripple, ~44px tall. External href -> plain <a>.
 */
export function CtaLink({
  href,
  variant = "default",
  size = "default",
  className,
  external,
  newTab,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  /** Abre en otra pestaña (para rutas internas; los http siempre lo hacen). */
  newTab?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { rippleProps, ripple } = useRipple();
  const classes = cn(base, sizes[size], variants[variant], className);
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#");
  const blankProps =
    newTab || href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (isExternal) {
    return (
      <a href={href} className={classes} {...rippleProps} {...blankProps}>
        {children}
        {ripple}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rippleProps} {...blankProps}>
      {children}
      {ripple}
    </Link>
  );
}
