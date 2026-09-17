import { Check, Hospital, ShieldCheck } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";
import { IPS_CONFIG } from "@/lib/ips-config";

const points = [
  "Gestión de Historias Clínicas digitales y atenciones",
  "Agenda médica centralizada por especialidad y consultorio",
  "Kardex de farmacia hospitalaria e insumos",
  "Facturación electrónica, RIPS y Cuentas Médicas",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="site-theme grid min-h-screen bg-slate-50 text-slate-900 lg:grid-cols-2 dark:bg-slate-950 dark:text-slate-100">
        <section className="relative isolate hidden overflow-hidden bg-slate-900 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 opacity-90" />
          <div className="relative z-10 max-w-lg">
            <span className="flex size-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Hospital className="size-6" />
            </span>
            <span className="mt-4 inline-block rounded bg-sky-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
              SanitasSalud IPS · Portal Asistencial (Demo)
            </span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white">
              Gestión Clínica & ERP Hospitalario Unificado
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Acceso seguro para cuerpo médico, admisiones, facturación electrónica, RIPS y cuentas médicas.
            </p>
            <ul className="mt-8 space-y-3.5">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <Check className="size-4 shrink-0 text-sky-400" /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="flex items-center gap-2 font-semibold text-slate-300">
                <ShieldCheck className="size-4 text-sky-400" />
                {IPS_CONFIG.brand.accreditation}
              </p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center bg-white px-4 py-12 sm:px-6 dark:bg-slate-900">
          <div className="w-full max-w-md">
            <ClinicWordmark className="mb-8 justify-center" />
            {children}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
