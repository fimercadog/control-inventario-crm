import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/features/public-leads/lead-form";
import { buildWhatsAppUrl } from "@/constants/site";

export function PropertyCTA({ propertyId, title, code }: { propertyId: number; title: string; code: string }) {
  const whatsappUrl = buildWhatsAppUrl(`Hola, estoy interesado en la propiedad ${code} - ${title}.`);

  return (
    <div className="bg-(--realty-surface) p-8">
      <div className="flex flex-col gap-5">
        <h2 className="text-3xl font-medium">Solicitar información</h2>
        <p className="text-sm leading-7 text-muted-foreground">Escríbenos por WhatsApp o deja tus datos y un asesor te contactará.</p>
        <Button asChild size="lg" className="w-full rounded-full bg-(--realty-accent) text-[0.68rem] font-extrabold uppercase text-white hover:bg-(--realty-accent)/90">
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </Link>
        </Button>

        <div className="flex items-center gap-3 text-[0.68rem] font-extrabold tracking-wide text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          o completa el formulario
          <span className="h-px flex-1 bg-border" />
        </div>

        <LeadForm
          intent="compra_arriendo"
          propertyId={propertyId}
          messagePlaceholder="Cuéntanos qué te gustaría saber sobre esta propiedad"
          submitLabel="Solicitar información"
        />
      </div>
    </div>
  );
}
