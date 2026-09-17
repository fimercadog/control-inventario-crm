import { ArrowRight, Building2, CheckCircle2, HeartPulse, Hospital, ShieldCheck, Stethoscope } from "lucide-react";
import { AppointmentCta } from "@/components/marketing/appointment-cta";
import { CtaLink } from "@/components/marketing/cta-link";
import { EmergencyBanner } from "@/components/marketing/emergency-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeHero } from "@/components/marketing/home-hero";
import { GradientBlob } from "@/components/marketing/gradient-blob";
import { IconFeatureFloatCard } from "@/components/marketing/icon-feature-float-card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { faqs, featuredServices, stats, team, testimonials } from "@/components/marketing/marketing-data";
import { Section, SectionHeading } from "@/components/marketing/marketing-ui";
import { OffsetBlobBlock } from "@/components/marketing/offset-blob-block";
import { PhotoFeatureStack } from "@/components/marketing/photo-feature-stack";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceGrid } from "@/components/marketing/service-card";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialGrid } from "@/components/marketing/testimonial-card";
import { VetGrid } from "@/components/marketing/vet-card";
import { IPS_CONFIG } from "@/lib/ips-config";

const whyUs = [
  { icon: "/gallery/icons/icon-16.png", title: "Médicos Especialistas", text: "Cuerpo médico en medicina interna, pediatría, cardiología y medicina general." },
  { icon: "/gallery/icons/icon-15.png", title: "Historias Clínicas", text: "Expediente digital unificado con trazabilidad completa de consultas y fórmulas." },
  { icon: "/gallery/icons/icon-13.png", title: "Laboratorio e Imágenes", text: "Procesamiento de muestras e imágenes diagnósticas integradas en la misma sede." },
  { icon: "/gallery/icons/icon-11.png", title: "Atención Humana & Oportuna", text: "Protocolos enfocados en la seguridad del paciente y tiempos de respuesta ágiles." },
];

export default function Home() {
  return (
    <MarketingLayout>
      {/* 1. Hero Principal inspirada en Doctors Office Landing Page */}
      <HomeHero />

      {/* 2. Portafolio de Servicios & Especialidades */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Especialidades & Servicios"
            title="Atención Médica Integral en un Solo Lugar"
            lead="Desde consulta médica general y preventiva hasta servicios asistenciales de atención prioritaria y diagnóstico."
          />
        </Reveal>
        <div className="mt-14">
          <ServiceGrid services={featuredServices} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/servicios" variant="outline" className="border-sky-600 font-bold text-sky-700 hover:bg-sky-50">
            Ver Todas las Especialidades
          </CtaLink>
        </div>
      </Section>

      {/* 3. Presentación de NOVA IPS */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <Reveal>
          <SectionHeading
            eyebrow="Prestador de Servicios de Salud"
            title="Salud Integral para las Familias"
            center={false}
          />
        </Reveal>
        <div className="mt-12">
          <PhotoFeatureStack
            image="/gallery/ips/consulta_medica.jpg"
            imageAlt="Médico especialista de NOVA IPS examinando a un paciente en consulta externa"
            features={[
              { title: "Consultorios & Unidades Equipadas", text: "Laboratorio automatizado y salas de observación disponibles según la configuración institucional y habilitación aplicable." },
              { title: "Consultas con el Tiempo Adecuado", text: "Evaluaciones exhaustivas con dedicación y enfoque preventivo." },
              { title: "Sedes de Atención (Demo)", text: "Atención continua con acceso ágil para pacientes." },
            ]}
          />
        </div>
        <div className="mt-8 flex justify-center lg:justify-start">
          <CtaLink href="/nosotros" variant="outline" size="sm" className="border-sky-600 font-bold text-sky-700">
            Conocer Nuestra Institución
          </CtaLink>
        </div>
      </Section>

      {/* 4. Razones Diferenciadoras */}
      <Section className="pb-0">
        <Reveal>
          <SectionHeading
            eyebrow="Modelo de Atención IPS"
            title="Cuatro Pilares de Excelencia Médica"
          />
        </Reveal>
      </Section>
      <IconFeatureFloatCard items={whyUs} />

      {/* 5. Equipo Médico Especialista */}
      <Section dark className="bg-slate-900">
        <Reveal>
          <SectionHeading
            eyebrow="Cuerpo Médico (Demo)"
            title="Especialistas al Cuidado de tu Salud"
            lead="Médicos y profesionales de la salud capacitados y comprometidos con tu bienestar."
            dark
          />
        </Reveal>
        <div className="mt-14">
          <VetGrid team={team} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/equipo" variant="ghost" className="text-sky-300 hover:bg-white/10 hover:text-white">
            Conocer Todo el Cuerpo Médico
            <ArrowRight className="size-4" />
          </CtaLink>
        </div>
      </Section>

      {/* 6. Bloque Medicina Preventiva */}
      <OffsetBlobBlock
        eyebrow="Medicina Preventiva & Chequeos"
        title="La Prevención Oportuna Salva Vidas"
        image="/gallery/ips/laboratorio_clinico.jpg"
        imageAlt="Laboratorio clínico automatizado en NOVA IPS"
        actions={
          <CtaLink href="/servicios" variant="outline" size="sm" className="border-sky-600 font-bold text-sky-700">
            Agendar Chequeo Preventivo
          </CtaLink>
        }
      >
        <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
          Los chequeos periódicos de laboratorio y toma de signos vitales permiten detectar factores de riesgo
          cardiovascular y metabólico antes de que generen complicaciones.
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
          {[
            "Chequeo médico integral anual según edad y perfil clínico",
            "Perfil lipídico, glicemia y función renal de alta precisión",
            "Historia clínica electrónica unificada y accesible",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </OffsetBlobBlock>

      {/* 7. Banner Atención Prioritaria */}
      <Section>
        <EmergencyBanner />
      </Section>

      {/* 8. Infraestructura & Sedes de Atención */}
      <Section className="bg-slate-50 dark:bg-slate-900/40">
        <Reveal>
          <SectionHeading
            eyebrow="Red de Atención IPS (Demo)"
            title="Sedes Diseñadas para tu Comodidad"
            lead="Instalaciones preparadas para la atención asistencial en ubicaciones estratégicas."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {IPS_CONFIG.sedes.map((sede) => (
            <div
              key={sede.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <span className="inline-block rounded-md bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {sede.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{sede.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sede.address}</p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{sede.services}</p>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-sky-700 dark:border-slate-800 dark:text-sky-400">
                PBX Directo: {sede.phone}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Indicadores & Cifras */}
      <Section dark className="bg-slate-950">
        <StatsSection stats={stats} dark />
      </Section>

      {/* 10. Testimonios de Pacientes */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Opiniones de Pacientes (Demo)"
            title="La Experiencia de Quienes Confían en NOVA IPS"
          />
        </Reveal>
        <div className="mt-14">
          <TestimonialGrid testimonials={testimonials} limit={3} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href="/testimonios" variant="outline" className="border-sky-600 font-bold text-sky-700">
            Ver Todos los Testimonios
          </CtaLink>
        </div>
      </Section>

      {/* 11. Preguntas Frecuentes */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <Reveal>
          <SectionHeading eyebrow="Preguntas Frecuentes" title="Resolvemos tus Dudas sobre la Atención Médica" />
        </Reveal>
        <div className="mt-14">
          <FaqAccordion faqs={faqs.slice(0, 5)} />
        </div>
      </Section>

      {/* 12. CTA Agendamiento de Citas */}
      <AppointmentCta />

      {/* 13. Ubicación Sede Principal */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Sede Principal Chicó (Demo)</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100">
              Visítanos en la Sede Chicó
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {IPS_CONFIG.contact.address}, {IPS_CONFIG.contact.city}.
              {IPS_CONFIG.contact.scheduleEmergency}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/contacto" variant="outline" className="border-sky-600 font-bold text-sky-700">
                Ver Datos de Contacto
              </CtaLink>
              <CtaLink
                href="https://www.google.com/maps/search/?api=1&query=Av.+Carrera+45+%23108-20%2C+Bogot%C3%A1"
                variant="ghost"
                className="text-sky-600"
              >
                Ver en Google Maps
              </CtaLink>
            </div>
          </Reveal>
          <Reveal delay={0.1} direction="fade" duration={0.8}>
            <div className="aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 shadow-lg dark:border-slate-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d127238.10319071656!2d-74.16085941045108!3d4.736901797248434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sla%2026%20con%207!5e0!3m2!1ses!2sco!4v1789530874639!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Ubicación NOVA IPS en Google Maps"
                className="size-full"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </MarketingLayout>
  );
}
