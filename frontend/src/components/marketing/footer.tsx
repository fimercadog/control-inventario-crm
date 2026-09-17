import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";
import { IPS_CONFIG } from "@/lib/ips-config";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Servicios IPS",
    links: [
      ["Consulta Medicina General", "/servicios"],
      ["Pediatría & Neonatología", "/servicios"],
      ["Laboratorio Clínico", "/servicios"],
      ["Atención Prioritaria / Triage", "/urgencias"],
      ["Cardiología & EKG", "/servicios"],
      ["Imágenes Diagnósticas", "/servicios"],
    ],
  },
  {
    title: "Institucional",
    links: [
      ["Cuerpo Médico Especialista", "/equipo"],
      ["Nuestras Sedes (Demo)", "/nosotros"],
      ["Agendar Cita Médica", "/agendar-cita"],
      ["Preguntas Frecuentes", "/preguntas-frecuentes"],
      ["Portal ERP Asistencial", "/login"],
    ],
  },
  {
    title: "Marco Institucional & Habilitación",
    links: [
      ["Información Institucional", "/nosotros"],
      ["Política de Protección de Datos", "/privacidad"],
      ["Términos de Atención Médica", "/terminos"],
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm space-y-4">
          <ClinicWordmark />
          <p className="text-sm leading-relaxed text-slate-300">
            {IPS_CONFIG.brand.tagline}
          </p>
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/40 p-3 text-xs text-sky-200">
            <p className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="size-4 text-sky-400" />
              {IPS_CONFIG.brand.accreditation}
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-400" />
              {IPS_CONFIG.contact.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-sky-400" />
              PBX: {IPS_CONFIG.contact.phoneDisplay}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-sky-400" />
              {IPS_CONFIG.contact.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-sky-400" />
              {IPS_CONFIG.contact.scheduleEmergency}
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    {...(href.startsWith("http") || href === "/login" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-slate-300 transition-colors hover:text-sky-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-slate-800 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {IPS_CONFIG.brand.name}. Prestador de Servicios de Salud (Datos Institucionales & Habilitación Configurables).
        </div>
      </div>
    </footer>
  );
}
