"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "zoom-in" | "zoom-out";

// Mobile recorre menos distancia que desktop (mismo espiritu, menos "viaje") --
// 12px/24px en vez de 24px fijo, 20px/32px en vez de 32px fijo.
const HIDDEN_BY_DIRECTION: Record<RevealDirection, string> = {
  up: "translate-y-3 sm:translate-y-6 opacity-0 blur-[2px]",
  down: "-translate-y-3 sm:-translate-y-6 opacity-0 blur-[2px]",
  left: "-translate-x-5 sm:-translate-x-8 opacity-0",
  right: "translate-x-5 sm:translate-x-8 opacity-0",
  // sin desplazamiento: para texto editorial largo, que entre con calma.
  fade: "opacity-0",
  // fotos protagonistas: escala sutil (0.96) en vez de mover posicion.
  "zoom-in": "scale-[0.97] sm:scale-[0.96] opacity-0",
  // hero: la foto de fondo arranca ligeramente ampliada y se asienta.
  "zoom-out": "scale-[1.03] sm:scale-[1.05] opacity-0",
};

/**
 * Motor de aparicion al scroll (o al montar): un solo primitivo, pero con
 * `direction` para que cada tipo de seccion tenga su propia entrada en vez
 * de repetir siempre el mismo fadeUp -- ver reveal-recipes.ts para el mapeo
 * seccion -> direccion/duracion/delay documentado por pagina.
 * `mount` dispara al cargar en vez de al hacer scroll (contenido above-the-fold).
 * IntersectionObserver + CSS transitions: SSR-safe, sin divergencia de hidratacion.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  mount = false,
  /** @deprecated usar direction="zoom-in" */
  zoom = false,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: RevealDirection;
  mount?: boolean;
  zoom?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const dir = zoom ? "zoom-in" : direction;

  useEffect(() => {
    if (mount) {
      const t = setTimeout(() => setShown(true), 60);
      return () => clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -64px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mount]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,filter] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]",
        !mount &&
          "motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:translate-x-0! motion-reduce:translate-y-0! motion-reduce:scale-100! motion-reduce:blur-0!",
        shown ? "translate-x-0 translate-y-0 scale-100 blur-0 opacity-100" : HIDDEN_BY_DIRECTION[dir],
        className,
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: delay ? `${delay}s` : undefined,
      }}
    >
      {children}
    </div>
  );
}
