import Link from "next/link";
import { Boxes, Check } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";

const points = ["CRM y ventas", "Control de inventario por bodega", "Pedidos que descuentan stock", "Reportes CSV y PDF"];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="site-theme grid min-h-screen bg-background text-foreground lg:grid-cols-2">
        <section className="relative isolate hidden overflow-hidden bg-ink px-12 py-16 text-ink-foreground lg:flex lg:flex-col lg:justify-center">
          <HeroBackdrop variant="navy" />
          <div className="relative max-w-lg">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-primary">
              <Boxes className="size-6" />
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight">
              Vende y controla tu inventario desde un solo lugar
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/70">
              Clientes, deals, pedidos, productos, bodegas y ordenes de compra en una sola plataforma.
            </p>
            <ul className="mt-10 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-medium">
                  <Check className="size-4 text-primary" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex items-center justify-center bg-background px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
                <Boxes className="size-5" />
              </span>
              <span className="text-base font-black tracking-tight">
                CRM<span className="text-primary">+</span>Inventario
              </span>
            </Link>
            {children}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
