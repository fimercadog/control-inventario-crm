import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section } from "@/components/marketing/marketing-ui";
import { devDocSections, userDocSections } from "@/components/marketing/marketing-data";

export const metadata: Metadata = {
  title: "Documentacion",
  description:
    "Dos vias: guias de uso para el equipo (CRM, inventario, pedidos, compras, reportes) y documentacion tecnica para integrar la API.",
};

type DocSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: string[];
};

function DocArticle({ section, index }: { section: DocSection; index: number }) {
  const Icon = section.icon;
  return (
    <Reveal delay={index * 0.04}>
      <article id={section.id} className="scroll-mt-28 rounded-2xl border border-border bg-card p-7">
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-xl border border-border text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="text-xl font-bold">{section.title}</h3>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {section.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

function TrackHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <Reveal>
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{lead}</p>
      </div>
    </Reveal>
  );
}

export default function DocumentationPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Documentacion"
        title="Guias para usar la plataforma y para integrarla"
        lead="Dos vias separadas: guias de uso para el equipo comercial, de bodega y administracion; y documentacion tecnica para desarrolladores que integran la API."
      />

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-5">
              {[
                { label: "Guias de uso", sections: userDocSections },
                { label: "Documentacion tecnica", sections: devDocSections },
              ].map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                  {group.sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <TrackHeading
              eyebrow="Guias de uso"
              title="Para usar la plataforma dia a dia"
              lead="Guias cortas y orientadas a tareas. El hilo conductor es el pedido de venta que descuenta stock de la bodega al confirmarse."
            />
            {userDocSections.map((section, i) => (
              <DocArticle key={section.id} section={section} index={i} />
            ))}

            <div className="pt-6">
              <TrackHeading
                eyebrow="Documentacion tecnica"
                title="Para integrar y desarrollar"
                lead="La plataforma es una API REST sobre Laravel. Para desarrolladores que conectan un e-commerce, un ERP contable u otra herramienta."
              />
            </div>
            {devDocSections.map((section, i) => (
              <DocArticle key={section.id} section={section} index={i} />
            ))}

            <Reveal>
              <div className="rounded-2xl bg-ink p-7 text-ink-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Referencia tecnica</p>
                <h2 className="mt-3 text-xl font-bold">API REST sobre Laravel + Sanctum</h2>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  La plataforma expone una API REST autenticada con Sanctum. Recursos por modulo:{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/leads</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/clientes</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/productos</code>,{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/pedidos</code> y{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/ordenes-compra</code>.
                </p>
                <div className="mt-6">
                  <CtaLink href="/contacto">Pedir acceso a la documentacion completa</CtaLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  );
}
