import { Check } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { DemoCta, Section, SectionHeading, cardHover } from "@/components/marketing/marketing-ui";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Esencial",
    tagline: "Para empezar a ordenar las ventas.",
    badge: "",
    features: ["Leads y formulario publico", "Clientes", "Deals (pipeline)", "Actividades de seguimiento"],
  },
  {
    name: "Operacion",
    tagline: "CRM e inventario conectados.",
    badge: "Mas popular",
    features: ["Todo Esencial", "Productos y bodegas", "Pedidos de venta", "Compras y proveedores"],
  },
  {
    name: "Avanzado",
    tagline: "Toda la operacion, con IA y control fino.",
    badge: "Premium",
    features: ["Todo Operacion", "Asistente de IA", "Auditoria y multiempresa", "Exportaciones CSV / PDF"],
  },
];

const faqs = [
  ["¿Como se define el precio?", "Segun numero de usuarios, cantidad de bodegas y modulos activos. En la demo validamos el alcance y te pasamos una propuesta."],
  ["¿Hay permanencia?", "No. El servicio se factura mensual y puedes cambiar de plan cuando lo necesites."],
  ["¿El asistente de IA esta incluido?", "Es un complemento del plan Avanzado. La interfaz esta lista; el proveedor de IA se conecta aparte."],
  ["¿Migran mis datos actuales?", "Se pueden cargar productos, clientes y saldos iniciales por importacion. Lo revisamos en la demo."],
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Precios"
        title="Planes preparados para crecer contigo"
        lead="Precios configurables. La prioridad inicial es validar alcance, numero de usuarios, cantidad de bodegas y modulos necesarios."
        actions={<CtaLink href="/demo">Solicitar demo</CtaLink>}
      />

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.06}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  plan.badge === "Mas popular" ? "border-primary shadow-elevation-3" : "border-border",
                  cardHover,
                )}
              >
                {plan.badge ? (
                  <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {plan.badge}
                  </span>
                ) : null}
                <h2 className="text-xl font-black tracking-tight">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="mt-6 text-sm text-muted-foreground">Precio a definir segun usuarios y bodegas.</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CtaLink
                    href="/demo"
                    variant={plan.badge === "Mas popular" ? "default" : "outline"}
                    className="w-full"
                  >
                    Solicitar demo
                  </CtaLink>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <Reveal>
          <SectionHeading eyebrow="Preguntas" title="Antes de agendar la demo" />
        </Reveal>
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-border">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.04}>
              <div className="py-6">
                <h3 className="text-base font-bold">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </MarketingLayout>
  );
}
