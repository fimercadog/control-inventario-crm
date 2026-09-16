import { Check, PawPrint } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";

const points = [
  "Propietarios, pacientes e historia clínica",
  "Agenda por profesional y consultorio",
  "Vacunas y desparasitación con recordatorios",
  "Inventario de farmacia y reportes clínicos",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="site-theme grid min-h-screen bg-background text-foreground lg:grid-cols-2">
        <section className="relative isolate hidden overflow-hidden bg-ink px-12 py-16 text-ink-foreground lg:flex lg:flex-col lg:justify-center">
          <HeroBackdrop variant="navy" />
          <div className="relative max-w-lg">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-primary">
              <PawPrint className="size-6" />
            </span>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight">
              Toda la clínica en una sola plataforma
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/70">
              Propietarios, pacientes, agenda, historia clínica, vacunas, inventario de farmacia y reportes en un solo lugar.
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
            {/* Misma identidad que el sitio publico (Los Andes), no la marca
                generica del software -- para que no se sienta como un producto
                distinto al llegar desde "Iniciar sesion". */}
            <ClinicWordmark className="mb-8 justify-center" />
            {children}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
