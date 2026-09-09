import { BarChart3, CalendarClock, Contact, Stethoscope, Syringe, Warehouse } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import {
  DemoCta,
  FeatureCard,
  ProblemGrid,
  Section,
  SectionHeading,
  TourGrid,
} from "@/components/marketing/marketing-ui";

const modules = [
  { icon: Contact, title: "Propietarios y pacientes", text: "Cada mascota con su ficha, ligada a su propietario.", href: "/producto/pacientes" },
  { icon: Stethoscope, title: "Historia clínica", text: "Consultas SOAP, diagnósticos, tratamientos y recetas.", href: "/producto/historia-clinica" },
  { icon: CalendarClock, title: "Citas y agenda", text: "Agenda por profesional y consultorio, con estados de cita.", href: "/producto/agenda" },
  { icon: Syringe, title: "Vacunas", text: "Aplicaciones con lote y vencimiento, y alertas de próximas dosis.", href: "/producto/vacunas" },
  { icon: Warehouse, title: "Inventario", text: "Medicamentos, vacunas e insumos con stock por bodega.", href: "/producto/inventario" },
  { icon: BarChart3, title: "Reportes clínicos", text: "Pacientes atendidos, vacunas, agenda e ingresos por servicio.", href: "/producto/reportes" },
];

export default function ProductOverviewPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Producto"
        title="Software de gestión para clínicas veterinarias"
        lead="Una plataforma que centraliza propietarios, pacientes, historia clínica, agenda, vacunas, inventario y reportes, con la parte clínica y el inventario conectados."
        actions={
          <>
            <CtaLink href="/demo">Solicitar demo</CtaLink>
            <CtaLink href="/precios" variant="outline">
              Ver precios
            </CtaLink>
          </>
        }
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Modulos conectados"
            title="La clínica y el inventario en una sola plataforma"
            lead="Cada modulo resuelve una parte concreta de la operacion diaria y comparte datos con el resto."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.05}>
              <a href={m.href} className="block h-full">
                <FeatureCard icon={m.icon} title={m.title} text={m.text} />
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <ProblemGrid />
      </Section>

      <Section>
        <TourGrid />
      </Section>

      <DemoCta />
    </MarketingLayout>
  );
}
