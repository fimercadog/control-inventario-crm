import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "CareNote",
    links: [
      ["Soluciones", "/servicios"],
      ["Equipo y liderazgo", "/equipo"],
      ["Atención domiciliaria", "/app/atenciones"],
      ["Nosotros", "/nosotros"],
      ["Preguntas frecuentes", "/preguntas-frecuentes"],
      ["Testimonios", "/testimonios"],
    ],
  },
  {
    title: "Plataforma",
    links: [
      ["Telegram Bot", "/app/telegram"],
      ["Pacientes", "/app/pacientes"],
      ["Contacto", "/contacto"],
      ["Iniciar sesión", "/login"],
    ],
  },
  {
    title: "Legal & Seguridad",
    links: [
      ["Política de datos", "/privacidad"],
      ["Términos y condiciones", "/terminos"],
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs">
          <ClinicWordmark />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Plataforma de atención domiciliaria y registro clínico automatizado por Telegram para enfermeros y terapeutas.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              Sede Central · Bogotá, Colombia
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-primary" />
              +57 601 555 0199
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-primary" />
              contacto@carenote.co
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              Soporte Plataforma: Lun a sáb, 7:00 a 20:00
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} CareNote - Atención Domiciliaria. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
