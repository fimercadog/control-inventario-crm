import { Reveal } from "@/components/marketing/reveal";
import type { Faq } from "@/components/marketing/marketing-data";

/**
 * Lista plana de 2 columnas, sin acordeon ni caja con borde -- patron real
 * del FAQ de Services/Contact en el pack Divi (distinto del acordeon
 * interactivo que se usa en Home y en /preguntas-frecuentes, donde la lista
 * es mas larga y el acordeon si aporta usabilidad real).
 */
export function FaqColumns({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
      {faqs.map((faq, i) => (
        // Entrada por grupos (por fila, no item a item): izq+der de la misma
        // fila comparten delay -- se siente como bloques, no como una lista larga.
        <Reveal key={faq.question} delay={Math.floor(i / 2) * 0.1}>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.1em]">{faq.question}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
        </Reveal>
      ))}
    </div>
  );
}
