import Link from "next/link";

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

/**
 * Campos compartidos por los formularios de captura del sitio publico
 * (contacto / demo y solicitud de cotizacion), para que se vean y validen
 * igual. Se renderiza dentro del <form> de cada pagina; el <form> aporta el
 * estado, el submit y el boton. `extended` agrega las preguntas de contexto
 * de la clínica (contacto / demo); la cotizacion no las usa.
 */
export function LeadFields({
  messagePlaceholder,
  extended = false,
}: {
  messagePlaceholder: string;
  extended?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" placeholder="Nombre" aria-label="Nombre" required className={inputClass} />
        <input name="company_name" placeholder="Clínica (opcional)" aria-label="Clínica" className={inputClass} />
        <input name="email" type="email" placeholder="Email" aria-label="Email" required className={inputClass} />
        <input name="phone" placeholder="WhatsApp" aria-label="WhatsApp" className={inputClass} />
        {extended ? (
          <>
            <input
              name="employee_count"
              placeholder="Nº de profesionales que atienden"
              aria-label="Número de profesionales"
              className={inputClass}
            />
            <input
              name="priority_module"
              placeholder="Qué te gustaría resolver primero"
              aria-label="Prioridad"
              className={inputClass}
            />
          </>
        ) : null}
      </div>
      <textarea
        name="message"
        className="mt-4 min-h-32 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        placeholder={messagePlaceholder}
        aria-label="Mensaje"
      />
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span>
          Autorizo el tratamiento de mis datos personales para ser contactado con fines comerciales, conforme a la
          Ley 1581 de 2012 y a la{" "}
          <Link href="/privacidad" className="font-medium text-primary underline">
            Politica de Tratamiento de Datos
          </Link>
          .
        </span>
      </label>
    </>
  );
}
