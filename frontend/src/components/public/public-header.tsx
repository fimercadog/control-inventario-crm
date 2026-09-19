"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLogo } from "@/components/public/public-logo";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV_LINKS } from "@/constants/public-navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/85">
      <div className="mx-auto flex h-20 max-w-330 items-center justify-between gap-6 px-6 lg:px-10">
        <PublicLogo textClassName="hidden sm:flex" />

        <nav className="hidden items-center gap-8 lg:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-bold tracking-wide text-foreground/75 uppercase transition-colors hover:text-foreground",
                isActive(pathname, link.href) ? "text-foreground" : "text-foreground/70",
              )}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-4 text-[0.68rem] font-extrabold uppercase text-foreground/75 hover:text-foreground">
            <Link href="/login" target="_blank" rel="noopener noreferrer">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" className="h-9 rounded-full bg-(--realty-accent) px-5 text-[0.68rem] font-extrabold uppercase text-white hover:bg-(--realty-accent)/90">
            <Link href="/vender-mi-propiedad">Vende tu propiedad</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="public-theme flex w-full flex-col gap-0 sm:max-w-xs">
            <SheetHeader>
              <SheetTitle asChild>
                <PublicLogo markClassName="size-10" textClassName="items-start" />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {PUBLIC_NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive(pathname, link.href) ? "bg-accent text-primary" : "text-foreground",
                    )}
                  >
                    {link.title}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/vender-mi-propiedad">Vende tu propiedad</Link>
                </Button>
              </SheetClose>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login" target="_blank" rel="noopener noreferrer">Acceso agentes</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
