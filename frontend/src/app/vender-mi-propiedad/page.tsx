import type { Metadata } from "next";
import { BadgeCheck, LineChart, Users } from "lucide-react";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { OwnerLeadForm } from "@/features/public-leads/owner-lead-form";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Vender o arrendar mi propiedad | ${SITE_CONFIG.name}`,
  description: "Cuéntanos sobre tu inmueble y un asesor te ayudará a publicarlo con el mejor precio del mercado.",
};

const REASONS = [
  {
    icon: LineChart,
    title: "Valoración con datos reales",
    description: "Analizamos el mercado local para sugerir un precio competitivo desde el primer día.",
  },
  {
    icon: Users,
    title: "Acceso a compradores calificados",
    description: "Tu inmueble llega a una base de clientes activos en búsqueda de propiedades como la tuya.",
  },
  {
    icon: BadgeCheck,
    title: "Acompañamiento hasta el cierre",
    description: "Un asesor gestiona visitas, negociación y documentación en cada etapa del proceso.",
  },
];

export default function VenderMiPropiedadPage() {
  return (
    <PublicContainer className="flex flex-col gap-12 py-14">
      <div className="realty-animate-fade-up">
        <SectionHeading
          level={1}
          eyebrow="Propietarios"
          title="¿Quieres vender o arrendar tu propiedad?"
          description="Cuéntanos los detalles de tu inmueble y un asesor se pondrá en contacto contigo para evaluarlo y coordinar su publicación."
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {REASONS.map((reason, index) => (
          <div
            key={reason.title}
            className={`realty-animate-fade-up realty-hover-lift flex flex-col gap-3 ${index === 1 ? "realty-animate-delay-1" : index === 2 ? "realty-animate-delay-2" : ""}`}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <reason.icon className="size-5" />
            </span>
            <h3 className="font-(family-name:--font-display) text-lg font-semibold">{reason.title}</h3>
            <p className="text-sm text-muted-foreground">{reason.description}</p>
          </div>
        ))}
      </div>

      <div className="realty-animate-scale-in realty-animate-delay-2 mx-auto w-full max-w-2xl">
        <OwnerLeadForm />
      </div>
    </PublicContainer>
  );
}
