import { PhoneCall, Siren } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/** Franja de urgencias del home — `/urgencias` tiene su propia sección, más completa. */
export function EmergencyBanner() {
  return (
    <Reveal>
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-accent bg-accent/60 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-10 sm:py-10">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-foreground text-accent">
            <Siren className="size-6" />
          </span>
          <div>
            <p className="text-lg font-black tracking-tight sm:text-xl">¿Es una urgencia?</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Accidentes, intoxicaciones o cuadros que empeoran rápido: escribinos o llamá antes de venir para que
              el equipo esté listo cuando llegues.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-3">
          <CtaLink href={WHATSAPP_URL} variant="cta">
            <PhoneCall className="size-4" />
            Urgencias por WhatsApp
          </CtaLink>
        </div>
      </div>
    </Reveal>
  );
}
