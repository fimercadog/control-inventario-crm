import Image from "next/image";
import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { CtaLink } from "@/components/marketing/cta-link";
import { FaqColumns } from "@/components/marketing/faq-columns";
import { FloatingContactCard } from "@/components/marketing/floating-contact-card";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { container } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

export default function ContactPage() {
  return (
    <MarketingLayout>
      {/* Hero: texto centrado sobre blob + ilustraciones flanqueando -- patrón "Veterinarian Contact". */}
      <section className="relative isolate overflow-hidden">
        <GradientBlob className="left-1/2 top-0 size-[150%] -translate-x-1/2 opacity-40" warm />
        <div className={`${container} relative py-16 text-center sm:py-20`}>
          <Reveal mount className="hidden sm:absolute sm:left-4 sm:top-8 sm:block sm:size-28 lg:left-12">
            <Image src="/gallery/illustrations/illustration-9.png" alt="" width={160} height={160} />
          </Reveal>
          <Reveal mount delay={0.1} className="hidden sm:absolute sm:right-4 sm:top-8 sm:block sm:size-28 lg:right-12">
            <Image src="/gallery/illustrations/illustration-3.png" alt="" width={160} height={160} />
          </Reveal>

          <Reveal mount>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cta">Contacto</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Escribinos</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Para agendar una cita usá el formulario de &ldquo;Agendar cita&rdquo;. Este canal es para consultas
              generales; ante una urgencia, escribinos directo por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <CtaLink href={WHATSAPP_URL} variant="cta">
                Escribinos por WhatsApp
              </CtaLink>
              <CtaLink href="/agendar-cita" variant="outline">
                Agendar cita
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <FloatingContactCard title="Escribinos cuando quieras" />
      </div>

      <Section>
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">Dejanos tu mensaje</h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Section>

      {/* Mapa -- mismo bloque de ubicacion que Home, patron real del pack
          (mapa/placeholder despues del formulario en Contact). */}
      <Section className="pt-0">
        <Reveal>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Calle+93+%2314-20%2C+Bogot%C3%A1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver ubicación de la clínica en Google Maps"
            className="group relative mx-auto flex aspect-21/9 w-full max-w-4xl items-center justify-center overflow-hidden rounded-3xl bg-secondary"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-size-[28px_28px] text-primary/15 opacity-60"
            />
            <span className="relative flex flex-col items-center gap-2 text-primary">
              <MapPin className="size-9" />
              <span className="text-sm font-semibold text-foreground">Ver ubicación en Google Maps</span>
            </span>
          </a>
        </Reveal>
      </Section>

      <Section className="bg-section-cream">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes" />
        </Reveal>
        <div className="mx-auto mt-12 max-w-4xl">
          <FaqColumns faqs={faqs.slice(0, 6)} />
        </div>
      </Section>
    </MarketingLayout>
  );
}
