import Image from "next/image";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

/**
 * Hero de Home al estilo del pack Divi "Veterinarian": foto full-bleed con
 * degradé oscuro para legibilidad, wordmark grande, dos botones píldora, y
 * una tarjeta de contacto flotante superpuesta sobre el borde inferior de la
 * foto (mismo patrón que la referencia: bloque blanco "Contact Us Anytime,
 * 7 days a Week" montado sobre el hero).
 */
export function HomeHero() {
  return (
    <section className="relative isolate">
      <div className="relative h-[600px] w-full overflow-hidden sm:h-[680px] lg:h-[760px]">
        <Image
          src="/gallery/paw-procedure.jpg"
          alt="Veterinario atendiendo la pata de un paciente en consulta"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/55 to-ink/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">Clínica veterinaria</p>
            <h1 className="mt-4 text-6xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Los Andes
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
              Cuidado veterinario cercano, de la consulta a la urgencia — un mismo equipo que conoce a tu mascota
              desde la primera visita.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href="/agendar-cita" variant="cta">
                Agendar cita
              </CtaLink>
              <CtaLink href="/servicios" variant="outline" className="border-white bg-white/95 text-ink hover:bg-white">
                Ver todos los servicios
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl bg-card p-8 shadow-elevation-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-center sm:p-10">
          <div>
            <h2 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
              Escribinos cuando quieras
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Urgencias 24/7 · resto de consultas, horario de atención.</p>
          </div>
          <div className="space-y-2.5 text-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Contacto</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Horario</p>
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
      </div>
    </section>
  );
}
