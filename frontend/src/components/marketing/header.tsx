"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";
import { CtaLink } from "@/components/marketing/cta-link";
import { cn } from "@/lib/utils";

const nav = [
  ["Inicio", "/"],
  ["Servicios", "/servicios"],
  ["Productos", "/catalogo"],
  ["Equipo", "/equipo"],
  ["Urgencias", "/urgencias"],
  ["Nosotros", "/nosotros"],
  ["Blog", "/blog"],
  ["Contacto", "/contacto"],
];

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
        "sticky top-0 z-40 bg-white font-nav transition-shadow",
        scrolled && "shadow-[0_0_30px_0_rgba(7,51,84,0.17)]",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <ClinicWordmark />

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Principal">
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap text-[15px] font-medium transition-colors hover:text-primary",
                  active ? "text-primary" : "text-[#20292f]",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-[15px] font-medium text-[#20292f] transition-colors hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <CtaLink href="/agendar-cita" size="sm" variant="cta" className="whitespace-nowrap">
            Agendar cita
          </CtaLink>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border border-border"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-4 py-4 xl:hidden">
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
            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              Iniciar sesión
            </Link>
          </nav>
          <div className="mt-3">
            <CtaLink href="/agendar-cita" className="w-full" variant="cta">
              Agendar cita
            </CtaLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
