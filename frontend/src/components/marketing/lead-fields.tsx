import Link from "next/link";

// Input gris relleno sin borde -- patron real del formulario de Contact en el
// pack Divi (no un input con borde + fondo blanco).
const inputClass =
  "h-11 w-full rounded-lg border-0 bg-muted px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary";

/**
 * Campos del formulario de contacto del sitio publico. Se renderiza dentro
 * del <form> de la pagina; el <form> aporta el estado, el submit y el boton.
 * Compartido entre /contacto (clinica) y /catalogo/cotizacion (base, e2e
 * `catalogo_publico.py` fija el placeholder por defecto de `company_name`)
 * — por eso ese campo es configurable en vez de hardcodeado.
 */
export function LeadFields({
  messagePlaceholder,
  secondaryField = { placeholder: "Clínica (opcional)", label: "Clínica" },
}: {
  messagePlaceholder: string;
  secondaryField?: { placeholder: string; label: string };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" placeholder="Nombre" aria-label="Nombre" required className={inputClass} />
        <input
          name="company_name"
          placeholder={secondaryField.placeholder}
          aria-label={secondaryField.label}
          className={inputClass}
        />
        <input name="email" type="email" placeholder="Email" aria-label="Email" required className={inputClass} />
        <input name="phone" placeholder="WhatsApp" aria-label="WhatsApp" className={inputClass} />
      </div>
      <textarea
        name="message"
        className="mt-4 min-h-32 w-full rounded-lg border-0 bg-muted px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        placeholder={messagePlaceholder}
        aria-label="Mensaje"
      />
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span>
          Autorizo el tratamiento de mis datos personales para ser contactado, conforme a la Ley 1581 de 2012 y a la{" "}
          <Link href="/privacidad" className="font-medium text-primary underline">
            Politica de Tratamiento de Datos
          </Link>
          .
        </span>
      </label>
    </>
  );
}
