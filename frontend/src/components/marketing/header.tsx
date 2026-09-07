"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Menu, X } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { cn } from "@/lib/utils";

const nav = [
  ["Producto", "/producto"],
  ["Precios", "/precios"],
  ["Documentacion", "/documentacion"],
  ["Blog", "/blog"],
  ["Nosotros", "/nosotros"],
  ["Contacto", "/contacto"],
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CRM + Inventario — inicio">
      <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
        <Boxes className="size-5" />
      </span>
      <span className="text-base font-black leading-none tracking-tight">
        CRM<span className="text-primary">+</span>Inventario
      </span>
    </Link>
  );
}

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        scrolled ? "border-border bg-background/90 backdrop-blur" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative text-sm transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 group-hover:w-full motion-reduce:transition-none",
                    active ? "w-full" : "w-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Iniciar sesion
          </Link>
          <CtaLink href="/demo" size="sm">
            Solicitar demo
          </CtaLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Movil">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm hover:bg-accent",
                  pathname === href && "bg-accent font-medium text-accent-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border-2 border-current text-sm font-semibold"
            >
              Iniciar sesion
            </Link>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
