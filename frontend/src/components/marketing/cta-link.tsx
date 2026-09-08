"use client";

import Link from "next/link";
import { useRipple } from "@/components/marketing/ripple";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "secondary";
type Size = "sm" | "default";

const base =
  "relative max-w-full overflow-hidden inline-flex items-center justify-center text-center rounded-full font-semibold transition-colors duration-150 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

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
};

/**
 * Divi-style pill CTA. Filled green by default; outline is a 2px ring in the
 * current text colour. Touch ripple, ~44px tall. External href -> plain <a>.
 */
export function CtaLink({
  href,
  variant = "default",
  size = "default",
  className,
  external,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { rippleProps, ripple } = useRipple();
  const classes = cn(base, sizes[size], variants[variant], className);
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#");

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...rippleProps}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {ripple}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rippleProps}>
      {children}
      {ripple}
    </Link>
  );
}
