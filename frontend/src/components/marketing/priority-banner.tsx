import { CtaLink } from "@/components/marketing/cta-link";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/**
 * Banner píldora oscuro de máxima prioridad -- "FOR EMERGENCIES CALL" del
 * pack Divi. Full-width, alto contraste, para el dato que no debería
 * perderse nunca en la página (urgencias).
 */
export function PriorityBanner({
  label = "Para urgencias, escribinos ya",
  detail = "+57 601 555 0188",
}: {
  label?: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-full bg-ink px-6 py-4 text-white shadow-elevation-3 sm:flex-row sm:px-10">
      <p className="text-sm font-bold uppercase tracking-[0.14em] sm:text-base">
        {label} <span className="font-extrabold text-cta">{detail}</span>
      </p>
      <CtaLink href={WHATSAPP_URL} variant="cta" size="sm">
        Escribir por WhatsApp
      </CtaLink>
    </div>
  );
}
