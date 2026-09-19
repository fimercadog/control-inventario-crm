import { PhoneCall, Sparkles } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/** Franja de asesoría prioritaria y agendamiento directo. */
export function EmergencyBanner() {
  return (
    <Reveal>
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-accent bg-accent/60 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-10 sm:py-10">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight sm:text-xl">¿Deseas atención directa o valoración prioritaria?</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Resuelve tus dudas sobre tratamientos, tiempos de recuperación o disponibilidad de agenda directamente con nuestra dirección médica por WhatsApp.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-3">
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Asesoría Médica por WhatsApp
          </CtaLink>
        </div>
      </div>
    </Reveal>
  );
}
