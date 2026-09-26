import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales",
  description:
    "Cómo la plataforma recolecta, usa y protege los datos personales, y cómo ejercer tus derechos conforme a la Ley 1581 de 2012.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Tratamiento de Datos Personales"
      updated="25 de septiembre de 2026"
      intro="Esta política describe el tratamiento que la plataforma da a los datos personales que recibe a través de este sitio web, en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1074 de 2015 y demás normas concordantes de la República de Colombia."
      sections={[
        {
          heading: "1. Responsable del tratamiento",
          body: [
            "Responsable: Escuela de Fútbol La Cantera S.A.S., identificada con NIT 901.245.880-3, con domicilio en Calle 170 #15-30, Bogotá, Colombia.",
            "Canal de atención para el ejercicio de derechos: contacto@lacanterafutbol.test. Teléfono / WhatsApp: +57 601 555 0188.",
          ],
        },
        {
          heading: "2. Datos que recolectamos",
          body: [
            "A través de los formularios de contacto y solicitud de clase de prueba recolectamos: nombre del acudiente, nombre del alumno/deportista, correo electrónico, número de teléfono o WhatsApp, categoría de interés y el contenido del mensaje que nos envíes.",
            "No solicitamos datos sensibles a través de este sitio. Si decides incluirlos en un campo de texto libre, se entenderá que autorizas su tratamiento para los fines aquí descritos.",
          ],
        },
        {
          heading: "3. Finalidades del tratamiento",
          body: [
            "Los datos se tratan para: (i) responder tus solicitudes de información; (ii) confirmar disponibilidad de cupo y agendar la clase de prueba o evaluación del aspirante; (iii) contactarte sobre el seguimiento del proceso de matrícula e inscripción; (iv) enviarte información sobre entrenamientos, torneos y cobros de mensualidades; y (v) atender obligaciones legales y requerimientos de autoridades competentes.",
          ],
        },
        {
          heading: "4. Autorización",
          body: [
            "Al marcar la casilla de autorización en el formulario y enviarlo, otorgas tu consentimiento previo, expreso e informado para el tratamiento de tus datos personales conforme a esta política.",
          ],
        },
        {
          heading: "5. Derechos del titular",
          body: [
            "Como titular de los datos tienes derecho a: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización otorgada; ser informado sobre el uso que se ha dado a tus datos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y/o solicitar la supresión de los datos cuando no exista un deber legal o contractual de conservarlos; y acceder de forma gratuita a tus datos.",
          ],
        },
        {
          heading: "6. Procedimiento para consultas y reclamos",
          body: [
            "Puedes ejercer tus derechos escribiendo a contacto@lacanterafutbol.test, indicando tu nombre, el derecho que deseas ejercer y una descripción de tu solicitud.",
            "Las consultas se atienden en un plazo máximo de diez (10) días hábiles. Los reclamos se atienden en un plazo máximo de quince (15) días hábiles, contados a partir del día siguiente a su recepción; si no es posible atenderlos dentro de ese plazo, se te informará sobre los motivos de la demora y la nueva fecha de respuesta, que no superará los ocho (8) días hábiles adicionales.",
          ],
        },
        {
          heading: "7. Conservación y seguridad",
          body: [
            "Los datos se conservan mientras exista una relación comercial activa o un interés legítimo de contacto, y por el tiempo adicional que exijan las obligaciones legales aplicables.",
            "Adoptamos medidas técnicas, humanas y administrativas razonables para proteger los datos contra acceso no autorizado, pérdida, alteración o uso fraudulento.",
          ],
        },
      ]}
    />
  );
}
