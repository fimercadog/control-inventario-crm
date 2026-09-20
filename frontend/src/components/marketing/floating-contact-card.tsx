import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

export function FloatingContactCard({
  title = "Planea tus vacaciones soñadas",
  mount = false,
  delay = 0,
}: {
  title?: string;
  mount?: boolean;
  delay?: number;
}) {
  return (
    <div className="grid gap-6 rounded-3xl bg-card p-8 shadow-elevation-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-center sm:p-10">
      <Reveal mount={mount} direction="up" delay={delay}>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Asesoría personalizada y soporte a viajeros 24/7 durante tu viaje.</p>
      </Reveal>
      <Reveal mount={mount} direction="left" delay={delay + 0.12} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Contacto</p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-sky-600" /> Av. 82 #11-30, Bogotá
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-sky-600" /> +57 601 744 9000
        </p>
        <p className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-sky-600" /> reservas@viajesglobales.com
        </p>
      </Reveal>
      <Reveal mount={mount} direction="right" delay={delay + 0.18} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Atención</p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-sky-600" /> Lun a sáb, 8:00 a 18:00
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-sky-600" /> Soporte en destino 24/7
        </p>
        <CtaLink href={WHATSAPP_URL} variant="ghost" size="sm" className="mt-1 px-0 text-sky-600 hover:bg-transparent">
          Hablar por WhatsApp con un asesor →
        </CtaLink>
      </Reveal>
    </div>
  );
}
