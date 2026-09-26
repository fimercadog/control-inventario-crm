import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso del sitio web y de las solicitudes de clase de prueba y contacto.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      updated="25 de septiembre de 2026"
      intro="Estos términos regulan el acceso y uso de este sitio web, operado por Escuela de Fútbol La Cantera S.A.S., NIT 901.245.880-3. Al navegar el sitio o enviar un formulario aceptas estos términos."
      sections={[
        {
          heading: "1. Objeto del sitio",
          body: [
            "Este sitio tiene una finalidad informativa: presentar los programas de la escuela de fútbol y su cuerpo técnico, y permitir solicitar una clase de prueba o enviar consultas sobre inscripciones.",
            "El acceso al panel privado de gestión de la escuela requiere credenciales asignadas al personal administrativo y técnico.",
          ],
        },
        {
          heading: "2. Uso permitido",
          body: [
            "Te comprometes a usar el sitio de forma lícita, a no interferir con su funcionamiento, a no intentar acceder a áreas restringidas y a proporcionar información veraz en los formularios.",
          ],
        },
        {
          heading: "3. Propiedad intelectual",
          body: [
            "Las marcas, logotipos, textos, diseños e interfaces del sitio son propiedad de Escuela de Fútbol La Cantera S.A.S. o de sus licenciantes. No se autoriza su reproducción o distribución sin autorización previa.",
          ],
        },
        {
          heading: "4. Solicitudes de prueba e inscripción",
          body: [
            "El envío de un formulario no confirma automáticamente una matrícula: la coordinación deportiva confirma disponibilidad de cupo y se pone en contacto para agendar la clase de evaluación.",
            "El tratamiento de los datos enviados a través de los formularios se rige por la Política de Tratamiento de Datos Personales.",
          ],
        },
        {
          heading: "5. Disponibilidad y contenido",
          body: [
            'El sitio se ofrece "tal cual". Procuramos que la información esté actualizada, pero puede estar sujeta a cambios en horarios de entrenamiento o sedes sin previo aviso.',
          ],
        },
        {
          heading: "6. Enlaces de terceros",
          body: [
            "El sitio puede incluir enlaces a servicios de terceros (por ejemplo, WhatsApp). No somos responsables del contenido ni de las políticas de esos servicios.",
          ],
        },
        {
          heading: "7. Limitación de responsabilidad",
          body: [
            "En la medida permitida por la ley, Escuela de Fútbol La Cantera S.A.S. no será responsable por daños indirectos o lucro cesante derivados del uso del sitio o de la imposibilidad de usarlo.",
          ],
        },
        {
          heading: "8. Ley aplicable y jurisdicción",
          body: [
            "Estos términos se rigen por la legislación de la República de Colombia. Cualquier controversia será sometida a las autoridades judiciales competentes de Bogotá D.C.",
          ],
        },
      ]}
    />
  );
}
