"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { CatalogCartProvider, useCatalogCart } from "@/lib/catalog-cart";

function QuoteFab() {
  const { count } = useCatalogCart();
  const pathname = usePathname();
  if (count === 0 || pathname === "/catalogo/cotizacion") return null;

  return (
    <Link
      href="/catalogo/cotizacion"
      className="fixed bottom-6 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevation-2 transition-colors hover:bg-primary-hover"
    >
      <FileText className="size-4" />
      Ver cotizacion ({count})
    </Link>
  );
}

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <CatalogCartProvider>
      {children}
      <QuoteFab />
    </CatalogCartProvider>
  );
}
