import { Check } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { DeviceMockup } from "@/components/marketing/device-mockup";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { container, Section, SectionHeading } from "@/components/marketing/marketing-ui";

type ProductPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: readonly string[];
  screenshot: string;
};

export function ProductPage({ eyebrow, title, description, bullets, screenshot }: ProductPageProps) {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        lead={description}
        actions={
          <>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/producto" variant="outline">
              Ver todo el producto
            </CtaLink>
          </>
        }
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Incluye" title="Lo que resuelve este modulo" center={false} />
            <ul className="mt-8 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm leading-6">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="font-medium">{bullet}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12} className="relative">
            <GradientBlob className="right-[-8%] top-[-8%] size-[65%]" float />
            <DeviceMockup src={screenshot} alt={title} tilt="right" />
          </Reveal>
        </div>
      </Section>

      <section className="bg-ink py-20 text-ink-foreground lg:py-24">
        <div className={`${container} grid gap-8 md:grid-cols-3`}>
          {["Reduce el trabajo manual", "Mejora la trazabilidad", "Da visibilidad al negocio"].map((item, i) => (
            <Reveal key={item} delay={i * 0.08}>
              <h3 className="text-lg font-bold">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Corre sobre una API Laravel con multiempresa, roles y permisos, auditoria de acciones y
                exportaciones CSV / PDF por modulo.
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
