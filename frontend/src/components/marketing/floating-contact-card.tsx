import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/**
 * Tarjeta de contacto flotante, superpuesta sobre el borde inferior de una
 * foto full-bleed (negative margin del padre). Mismo bloque "Contact Us
 * Anytime, 7 days a Week" que reaparece en Home y Contact del pack Divi.
 * `mount` para cuando la tarjeta ya esta en el viewport al cargar (debajo del
 * hero); si no, se revela por scroll como el resto de la pagina.
 */
export function FloatingContactCard({
  title = "Contáctanos cuando quieras",
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
        <p className="mt-2 text-sm text-muted-foreground">Consultas, valoraciones y tratamientos en nuestro horario de atención.</p>
      </Reveal>
      {/* Datos de contacto y horario entran desde los costados */}
      <Reveal mount={mount} direction="left" delay={delay + 0.12} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Contacto</p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" /> Calle 93 #14-20, Bogotá
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-primary" /> +57 601 555 0188
        </p>
        <p className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-primary" /> contacto@esteticaelite.co
        </p>
      </Reveal>
      <Reveal mount={mount} direction="right" delay={delay + 0.18} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Horario</p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" /> Lun a sáb, 8:00 a 19:00
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" /> Atención con cita previa
        </p>
        <CtaLink href={WHATSAPP_URL} variant="ghost" size="sm" className="mt-1 px-0 text-primary hover:bg-transparent">
          Escríbenos por WhatsApp →
        </CtaLink>
      </Reveal>
    </div>
  );
}
