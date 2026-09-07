"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal on scroll (or on mount): rise + blur-in + fade.
 * `mount` fires on load instead of on scroll (above-the-fold content).
 * `zoom` swaps the rise for a scale-down (hero screenshot / images).
 * CSS transitions + IntersectionObserver: SSR-safe, no hydration divergence.
 */
export function Reveal({
  children,
  delay = 0,
  mount = false,
  zoom = false,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  mount?: boolean;
  zoom?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

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
        "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]",
        !mount &&
          "motion-reduce:transition-opacity motion-reduce:duration-500 motion-reduce:translate-y-0! motion-reduce:scale-100! motion-reduce:blur-0!",
        shown
          ? "translate-y-0 scale-100 blur-0 opacity-100"
          : zoom
            ? "scale-[1.14] opacity-0 blur-md"
            : "translate-y-12 scale-[0.97] opacity-0 blur-sm",
        className,
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
