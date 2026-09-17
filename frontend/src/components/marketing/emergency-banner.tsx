import { PhoneCall, Siren } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { IPS_CONFIG } from "@/lib/ips-config";

/** Franja de Atención Prioritaria para NOVA IPS */
export function EmergencyBanner() {
  return (
    <Reveal>
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-sky-200 bg-sky-50/90 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-10 sm:py-10 sm:text-left dark:border-sky-900/50 dark:bg-sky-950/40">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-700 text-white shadow-md">
            <Siren className="size-7" />
          </span>
          <div>
            <span className="inline-block rounded bg-sky-200/80 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-900 dark:bg-sky-900 dark:text-sky-200">
              Triage & Atención Prioritaria (Configurable)
            </span>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ¿Requiere atención médica prioritaria?
            </p>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Servicios disponibles según la configuración institucional y habilitación aplicable. Línea de atención:{" "}
              <strong className="font-bold text-slate-900 dark:text-slate-100">{IPS_CONFIG.contact.emergencyPhoneDisplay}</strong>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-3">
          <CtaLink href={IPS_CONFIG.social.whatsapp} variant="cta" className="bg-sky-700 font-bold text-white hover:bg-sky-800">
            <PhoneCall className="size-4" />
            Línea de Atención Directa
          </CtaLink>
        </div>
      </div>
    </Reveal>
  );
}
