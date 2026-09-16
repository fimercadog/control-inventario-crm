import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/**
 * Tarjeta de contacto flotante, superpuesta sobre el borde inferior de una
 * foto full-bleed (negative margin del padre). Mismo bloque "Contact Us
 * Anytime, 7 days a Week" que reaparece en Home y Contact del pack Divi.
 */
export function FloatingContactCard({ title = "Escribinos cuando quieras" }: { title?: string }) {
  return (
    <div className="grid gap-6 rounded-3xl bg-card p-8 shadow-elevation-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-center sm:p-10">
      <div>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Urgencias 24/7 · resto de consultas, horario de atención.</p>
      </div>
      <div className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Contacto</p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" /> Calle 93 #14-20, Bogotá
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-primary" /> +57 601 555 0188
        </p>
        <p className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-primary" /> recepcion@vetlosandes.co
        </p>
      </div>
      <div className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Horario</p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" /> Lun a sáb, 8:00 a 19:00
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" /> Urgencias los 7 días
        </p>
        <CtaLink href={WHATSAPP_URL} variant="ghost" size="sm" className="mt-1 px-0 text-primary hover:bg-transparent">
          Escribinos por WhatsApp →
        </CtaLink>
      </div>
    </div>
  );
}
