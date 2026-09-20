import { Plane, Check } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";

const points = [
  "Gestión integral de viajeros, familias y grupos",
  "Reservas de paquetes turísticos, vuelos y hoteles",
  "Itinerarios de viaje detallados y vouchers",
  "Ventas, abonos, cartera y cuentas por pagar a proveedores",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="site-theme grid min-h-screen bg-background text-foreground lg:grid-cols-2">
        <section className="relative isolate hidden overflow-hidden bg-slate-950 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-center">
          <HeroBackdrop variant="navy" />
          <div className="relative max-w-lg">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Plane className="size-6" />
            </span>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight">
              Toda tu agencia de viajes en una sola plataforma
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Reservas, destinos, itinerarios, paquetes turísticos, tiquetes, hoteles, viajeros y finanzas en un solo lugar.
            </p>
            <ul className="mt-10 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-medium text-slate-200">
                  <Check className="size-4 text-sky-400" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex items-center justify-center bg-background px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <ClinicWordmark className="mb-8 justify-center" />
            {children}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
