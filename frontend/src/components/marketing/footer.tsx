import Link from "next/link";
import { PawPrint } from "lucide-react";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Producto",
    links: [
      ["Propietarios y pacientes", "/producto/pacientes"],
      ["Historia clínica", "/producto/historia-clinica"],
      ["Citas y agenda", "/producto/agenda"],
      ["Vacunas y recordatorios", "/producto/vacunas"],
      ["Inventario", "/producto/inventario"],
      ["Reportes clínicos", "/producto/reportes"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Precios", "/precios"],
      ["Centro de ayuda", "/documentacion"],
      ["Para desarrolladores", "/documentacion/desarrolladores"],
      ["Blog", "/blog"],
      ["Nosotros", "/nosotros"],
      ["Solicitar demo", "/demo"],
      ["Iniciar sesion", "/login"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Politica de datos", "/privacidad"],
      ["Terminos y condiciones", "/terminos"],
      ["Contacto", "/contacto"],
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
              <PawPrint className="size-5" />
            </span>
            <span className="text-base font-black tracking-tight">
              Vet<span className="text-primary">·</span>Panel
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Software de gestión para clínicas veterinarias: propietarios, pacientes, historia clínica, agenda,
            vacunas e inventario en una sola plataforma.
          </p>
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
          © {new Date().getFullYear()} VetPanel. Sitio publico y plataforma privada separados.
        </div>
      </div>
    </footer>
  );
}
