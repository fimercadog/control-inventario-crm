import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section } from "@/components/marketing/marketing-ui";
import { docSections } from "@/components/marketing/marketing-data";

export const metadata: Metadata = {
  title: "Documentacion",
  description: "Guias de uso: CRM, control de inventario, pedidos de venta, compras, reportes y API.",
};

export default function DocumentationPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Documentacion"
        title="Todo lo que necesitas para poner a andar la plataforma"
        lead="Guias cortas y orientadas a tareas para el CRM, el control de inventario y el puente entre ambos: el pedido de venta que descuenta stock."
      />

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-1">
              {docSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            {docSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.id} delay={index * 0.04}>
                  <article id={section.id} className="scroll-mt-28 rounded-2xl border border-border bg-card p-7">
                    <div className="flex items-center gap-4">
                      <span className="grid size-11 place-items-center rounded-xl border border-border text-primary">
                        <Icon className="size-5" />
                      </span>
                      <h2 className="text-xl font-bold">{section.title}</h2>
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
            })}

            <Reveal>
              <div className="rounded-2xl bg-ink p-7 text-ink-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Referencia tecnica</p>
                <h2 className="mt-3 text-xl font-bold">API REST sobre Laravel + Sanctum</h2>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  La plataforma expone una API REST autenticada con tokens Sanctum. Endpoints por modulo:{" "}
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
