import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ClinicWordmark } from "@/components/marketing/clinic-brand";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Escuela",
    links: [
      ["Programas & Categorías", "/servicios"],
      ["Cuerpo técnico", "/equipo"],
      ["Tienda & Indumentaria", "/catalogo"],
      ["Nosotros", "/nosotros"],
      ["Preguntas frecuentes", "/preguntas-frecuentes"],
      ["Testimonios", "/testimonios"],
    ],
  },
  {
    title: "Recursos",
    links: [
      ["Blog Deportivo", "/blog"],
      ["Clase de prueba", "/solicitar-cita"],
      ["Contacto", "/contacto"],
      ["Acceso al panel ERP", "/login"],
    ],
  },
  {
    title: "Legal",
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
            Formación deportiva de alto rendimiento para niños y jóvenes: categorías Semillero Sub-8 a Sub-17, entrenamiento de arqueros y competición de liga.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              Calle 170 #15-30, Bogotá
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-primary" />
              +57 601 555 0188
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-primary" />
              contacto@lacanterafutbol.test
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              Lun a sáb, 6:00 a 20:00
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
                    {...(href === "/login" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
          © {new Date().getFullYear()} Escuela de Fútbol La Cantera S.A.S.
        </div>
      </div>
    </footer>
  );
}
