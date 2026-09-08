import Link from "next/link";
import { Boxes } from "lucide-react";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Producto",
    links: [
      ["CRM", "/producto/crm"],
      ["Inventario", "/producto/inventario"],
      ["Pedidos de venta", "/producto/pedidos"],
      ["Compras", "/producto/compras"],
      ["Reportes", "/producto/reportes"],
      ["Asistente de IA", "/producto/ia"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Precios", "/precios"],
      ["Documentacion", "/documentacion"],
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
              <Boxes className="size-5" />
            </span>
            <span className="text-base font-black tracking-tight">
              CRM<span className="text-primary">+</span>Inventario
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            CRM y control de inventario conectados por el pedido de venta, para PYMES que quieren ordenar su
            operacion sin hacerla pesada.
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
          © {new Date().getFullYear()} CRM + Inventario. Sitio publico y plataforma privada separados.
        </div>
      </div>
    </footer>
  );
}
