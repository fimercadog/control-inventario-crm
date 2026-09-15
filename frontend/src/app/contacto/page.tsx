import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Section } from "@/components/marketing/marketing-ui";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { WHATSAPP_URL } from "@/components/marketing/whatsapp-link";

const info = [
  { icon: MapPin, text: "Calle 93 #14-20, Bogotá" },
  { icon: Phone, text: "+57 601 555 0188" },
  { icon: Mail, text: "recepcion@vetlosandes.co" },
  { icon: Clock, text: "Lun a sáb, 8:00 a 19:00 · Urgencias 24/7" },
];

export default function ContactPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Contacto"
        title="Escribinos y te respondemos a la brevedad"
        lead="Para agendar una cita usá el formulario de “Agendar cita”. Este canal es para consultas generales; ante una urgencia, escribinos directo por WhatsApp."
      />

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <h2 className="text-2xl font-black tracking-tight">Datos de la clínica</h2>
            <ul className="mt-5 space-y-3 text-sm text-foreground/85">
              {info.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="size-4.5 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <CtaLink href={WHATSAPP_URL} variant="cta">
                Escribinos por WhatsApp
              </CtaLink>
              <CtaLink href="/agendar-cita" variant="outline">
                Agendar cita
              </CtaLink>
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
