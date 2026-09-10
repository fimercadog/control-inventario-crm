import { ContactForm } from "@/components/marketing/contact-form";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { ContactChannels, Section } from "@/components/marketing/marketing-ui";

export default function ContactPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Contacto"
        title="Hablemos de la gestión de tu clínica"
        lead="Cuéntanos cuántos profesionales atienden, qué procesos llevas hoy en papel o en Excel y qué te gustaría priorizar."
      />

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <h2 className="text-2xl font-black tracking-tight">Escribenos</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Respondemos en horario laboral. Si prefieres, escribenos directo por WhatsApp o entra con tu cuenta.
            </p>
            <div className="mt-6">
              <ContactChannels />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
