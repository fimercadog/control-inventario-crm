import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Reveal } from "@/components/marketing/reveal";
import { IPS_CONFIG } from "@/lib/ips-config";

/**
 * Tarjeta de contacto asistencial de SanitasSalud IPS.
 * Superpuesta sobre la imagen del Hero con datos directos de líneas de atención y datos demo configurables.
 */
export function FloatingContactCard({
  title = "Líneas de Atención & Servicios Habilitados",
  mount = false,
  delay = 0,
}: {
  title?: string;
  mount?: boolean;
  delay?: number;
}) {
  return (
    <div className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl sm:grid-cols-[1.1fr_1fr_1fr] sm:items-center sm:p-10 dark:border-slate-800 dark:bg-slate-900">
      <Reveal mount={mount} direction="up" delay={delay}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
          <ShieldCheck className="size-3.5" /> {IPS_CONFIG.brand.descriptor}
        </span>
        <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">{title}</h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Atención médica e información institucional configurable en el ERP.</p>
      </Reveal>
      <Reveal mount={mount} direction="left" delay={delay + 0.12} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Líneas Directas (Demo)</p>
        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Phone className="size-4 shrink-0 text-sky-600" /> PBX: {IPS_CONFIG.contact.phoneDisplay}
        </p>
        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Phone className="size-4 shrink-0 text-sky-600" /> Línea Directa: {IPS_CONFIG.contact.emergencyPhoneDisplay}
        </p>
        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Mail className="size-4 shrink-0 text-sky-600" /> {IPS_CONFIG.contact.email}
        </p>
      </Reveal>
      <Reveal mount={mount} direction="right" delay={delay + 0.18} className="space-y-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Sede Principal Chicó (Demo)</p>
        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <MapPin className="size-4 shrink-0 text-sky-600" /> {IPS_CONFIG.contact.address}
        </p>
        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Clock className="size-4 shrink-0 text-sky-600" /> {IPS_CONFIG.contact.scheduleEmergency}
        </p>
        <CtaLink href={IPS_CONFIG.social.whatsapp} variant="ghost" size="sm" className="mt-1 px-0 text-sky-600 hover:bg-transparent hover:text-sky-700">
          Solicitar cita por WhatsApp →
        </CtaLink>
      </Reveal>
    </div>
  );
}
