"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Drop = { key: number; x: number; y: number; size: number };

/**
 * Material touch ripple. Spread `rippleProps` on a
 * `relative overflow-hidden` element and render `{ripple}` as its last child.
 */
export function useRipple() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const seq = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const key = seq.current++;
    setDrops((d) => [
      ...d,
      { key, size, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2 },
    ]);
    window.setTimeout(() => setDrops((d) => d.filter((x) => x.key !== key)), 550);
  }, []);

  const ripple = drops.map((d) => (
    <span
      key={d.key}
      aria-hidden
      className="animate-mat-ripple pointer-events-none absolute rounded-full bg-current opacity-25 motion-reduce:hidden"
      style={{ left: d.x, top: d.y, width: d.size, height: d.size }}
    />
  ));

  return { rippleProps: { onPointerDown }, ripple };
}

/** A Next `<Link>` styled as a Material surface — clips and ripples on tap. */
export function RippleLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { rippleProps, ripple } = useRipple();
  return (
    <Link href={href} className={cn("relative overflow-hidden", className)} {...rippleProps}>
      {children}
      {ripple}
    </Link>
  );
}
