import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Boxes,
  ClipboardList,
  Handshake,
  History,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { DeviceMockup } from "@/components/marketing/device-mockup";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { Reveal } from "@/components/marketing/reveal";
import { WidgetCluster } from "@/components/marketing/widget-card";
import { container } from "@/components/marketing/page-hero";
import { cn } from "@/lib/utils";

export { container };

export const cardHover = "transition-colors duration-200 hover:border-primary/50";

export function Section({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(dark && "bg-ink text-ink-foreground", "py-20 lg:py-28", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = true,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-8", dark ? "text-white/70" : "text-muted-foreground")}>{lead}</p>
      )}
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className={cn("group flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}>
      <span className="grid size-11 place-items-center rounded-xl border border-border text-primary transition-colors group-hover:border-primary/50">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

/** Alternating detail row: copy + pill on one side, widget cluster / screenshot on the other. */
export function FeatureRow({
  eyebrow,
  title,
  lead,
  points,
  screenshot,
  alt,
  reverse = false,
  note,
  cta = { href: "/demo", label: "Solicitar demo" },
}: {
  eyebrow: string;
  title: string;
  lead: string;
  points: { icon: React.ElementType; text: string }[];
  screenshot?: string;
  alt?: string;
  reverse?: boolean;
  note?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-2`}>
      <Reveal className={reverse ? "lg:order-2" : undefined}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{lead}</p>
        <ul className="mt-7 space-y-3">
          {points.map((p) => (
            <li key={p.text} className="flex gap-3 text-sm leading-6">
              <p.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
        {note && <p className="mt-5 text-xs text-muted-foreground">{note}</p>}
        <div className="mt-8">
          <CtaLink href={cta.href} variant="outline" size="sm">
            {cta.label}
          </CtaLink>
        </div>
      </Reveal>
      <Reveal delay={0.12} className={cn("relative", reverse ? "lg:order-1" : undefined)}>
        {screenshot ? (
          <>
            <GradientBlob
              className={cn("size-[65%]", reverse ? "left-[-8%] top-[-8%]" : "right-[-8%] top-[-8%]")}
              float
            />
            <DeviceMockup src={screenshot} alt={alt ?? title} tilt={reverse ? "left" : "right"} />
          </>
        ) : (
          <WidgetCluster />
        )}
      </Reveal>
    </div>
  );
}

const platformItems = [
  { icon: Handshake, title: "CRM", text: "Leads, clientes, deals y actividades con responsable claro." },
  { icon: Boxes, title: "Inventario", text: "Productos, bodegas y movimientos que mueven el stock en el momento." },
  { icon: ClipboardList, title: "Pedidos de venta", text: "Al confirmarse descuentan stock de la bodega elegida." },
  { icon: Truck, title: "Compras", text: "Proveedores y ordenes de compra que reponen inventario al recibirse." },
  { icon: BarChart3, title: "Reportes", text: "Metricas de CRM e inventario, exportables a CSV o PDF." },
  { icon: ShieldCheck, title: "Control de acceso", text: "Roles y permisos por modulo, con roles a medida y auditoria." },
];

export function PlataformaGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="La solucion"
          title="Una sola plataforma"
          lead="Todo sobre la misma base de datos — con un asistente de IA opcional."
        />
      </Reveal>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platformItems.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <FeatureCard icon={item.icon} title={item.title} text={item.text} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

const tourShots = [
  { src: "/product/clientes.png", alt: "Listado de clientes con filtros y exportacion", tilt: "right" as const },
  { src: "/product/stock.png", alt: "Vista de stock por bodega con valorizacion", tilt: "left" as const },
];

export function TourGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="El producto real"
          title="Asi se ve por dentro"
          lead="Capturas del sistema en funcionamiento — no maquetas."
        />
      </Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {tourShots.map((shot, i) => (
          <Reveal key={shot.src} delay={i * 0.1} className="relative">
            <GradientBlob className={cn("size-[55%]", shot.tilt === "right" ? "right-0 top-[-6%]" : "left-0 top-[-6%]")} />
            <DeviceMockup src={shot.src} alt={shot.alt} tilt={shot.tilt} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

const beforeAfter: { icon: React.ElementType; before: string; after: string }[] = [
  { icon: Boxes, before: "Stock en una hoja de calculo que nunca cuadra", after: "Inventario por bodega con bitacora de cada movimiento" },
  { icon: Handshake, before: "Leads en libretas y chats sueltos", after: "Clientes y deals en un pipeline con seguimiento" },
  { icon: ClipboardList, before: "Pedidos por WhatsApp sin descontar stock", after: "El pedido confirmado descuenta stock de la bodega" },
  { icon: Truck, before: "Compras sin control de lo que entra", after: "Ordenes de compra que reponen stock al recibirse" },
  { icon: ArrowLeftRight, before: "Nadie sabe por que cambio una cantidad", after: "Cada entrada, salida y ajuste queda registrado" },
  { icon: History, before: "Reportes armados a mano cada fin de mes", after: "Reportes al instante, exportables a CSV o PDF" },
];

export function ProblemGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="Antes vs ahora"
          title="Menos Excel. Mas control."
          lead="La plataforma convierte planillas sueltas y pedidos por chat en un flujo unico donde vender mueve el inventario y comprar lo repone."
        />
      </Reveal>
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {beforeAfter.map((row, i) => {
          const Icon = row.icon;
          return (
            <Reveal key={row.after} delay={i * 0.05}>
              <div className={cn("flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}>
                <span className="grid size-11 place-items-center rounded-xl border border-border text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-sm text-muted-foreground line-through decoration-destructive/50">{row.before}</p>
                <p className="mt-2 text-sm font-semibold">{row.after}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

/** Dark closing band with a gradient blob and a laptop mockup. */
export function DemoCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-ink-foreground lg:py-28">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-2`}>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Empieza</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Pon tu operacion sobre rieles
          </h2>
          <p className="mt-4 max-w-md text-lg leading-8 text-white/70">
            Te mostramos el sistema con tus casos de uso y resolvemos tus dudas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/login" newTab variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Ya tengo cuenta
            </CtaLink>
          </div>
        </Reveal>
        <Reveal delay={0.12} className="relative">
          <GradientBlob className="left-[-6%] top-[-10%] size-[70%]" float />
          <DeviceMockup src="/product/dashboard.png" alt="Panel de CRM + Inventario" tilt="left" />
        </Reveal>
      </div>
    </section>
  );
}

/** Contact channels — WhatsApp / login. Used on /demo and /contacto. */
const WHATSAPP_URL = "https://wa.me/573058148918";

export function ContactChannels() {
  return (
    <div className="flex flex-wrap gap-3">
      <CtaLink href={WHATSAPP_URL}>Escribenos por WhatsApp</CtaLink>
      <CtaLink href="/login" newTab variant="ghost">
        Ya tengo cuenta
      </CtaLink>
    </div>
  );
}

const aiUses: { icon: React.ElementType; title: string; text: string }[] = [
  { icon: Boxes, title: "Consultar stock", text: "\"¿Cuantas unidades del Teclado K120 quedan en Bodega Central?\"" },
  { icon: Handshake, title: "Ficha de cliente", text: "\"Muestrame el ultimo contacto y los deals abiertos de Distribuidora Sur.\"" },
  { icon: ClipboardList, title: "Estado de pedidos", text: "\"¿Que pedidos estan pendientes de confirmar esta semana?\"" },
  { icon: Bot, title: "Crear registros", text: "\"Crea un pedido de 10 teclados para Distribuidora Sur.\"" },
];

export function AiUsesGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {aiUses.map((item, i) => (
        <Reveal key={item.title} delay={i * 0.05}>
          <FeatureCard icon={item.icon} title={item.title} text={item.text} />
        </Reveal>
      ))}
    </div>
  );
}
