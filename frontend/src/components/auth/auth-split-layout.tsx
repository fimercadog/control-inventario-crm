import Image from "next/image";
import { Check, Stethoscope } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";

const points = [
  "Expediente unificado de pacientes y atenciones",
  "Captura de notas clínicas por Telegram con voz o texto",
  "Informes estructurados automáticamente con n8n e IA",
  "Consentimientos informados y firmas de privacidad",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <main className="site-theme grid min-h-screen bg-background text-foreground lg:grid-cols-2">
        <section className="relative isolate hidden overflow-hidden bg-slate-950 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-center">
          <Image
            src="/carenote/login-bg.jpg"
            alt="Atención domiciliaria de enfermería"
            fill
            className="object-cover opacity-25 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950/60" />
          <div className="relative z-10 max-w-lg">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
              <Stethoscope className="size-6" />
            </span>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white">
              Toda tu atención domiciliaria en una sola plataforma
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Captura notas por voz en Telegram, automatiza informes clínicos con n8n e IA y gestiona el expediente de tus pacientes sin esfuerzo.
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-medium text-slate-200">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    <Check className="size-3.5" />
                  </span>
                  {p}
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
