/**
 * Configuración Centralizada de la Clínica (Marca, Contacto y Datos Demo).
 * Permite cambiar la marca, teléfonos, dirección y valores demo desde un solo lugar
 * sin hardcodear información en componentes.
 */

export const CLINIC_CONFIG = {
  // Configuración de Marca (Demo por defecto)
  isDemoMode: true,
  demoNoticeText: "Información y datos de demostración configurables en el ERP",
  
  brand: {
    name: "Élysée Medicina Estética",
    shortName: "Élysée",
    tagline: "Salud cutánea, rejuvenecimiento y estética médica de precisión",
    descriptor: "Clínica Médica Estética",
  },

  contact: {
    address: "Calle 93 #14-20, Sede Medicina Estética",
    city: "Bogotá, Colombia",
    phoneDisplay: "+57 601 555 0199",
    phoneRaw: "+576015550199",
    whatsappDisplay: "+57 300 555 0199",
    whatsappRaw: "573005550199",
    email: "contacto@elyseestetica.co",
    schedule: "Lunes a Viernes: 8:00 a 19:00 · Sábados: 8:00 a 14:00",
    scheduleShort: "Lun-Vier: 8am-7pm | Sáb: 8am-2pm",
  },

  social: {
    instagram: "https://instagram.com/elysee.estetimedic",
    facebook: "https://facebook.com/elysee.estetimedic",
    whatsapp: "https://wa.me/573005550199?text=Hola,%20deseo%20agendar%20una%20valoración%20estética",
  },

  stats: [
    { value: "10+", label: "años de trayectoria clínica", isDemo: true },
    { value: "4.500+", label: "valoraciones médicas", isDemo: true },
    { value: "100%", label: "protocolos individualizados", isDemo: true },
    { value: "4.9/5", label: "satisfacción de pacientes", isDemo: true },
  ],
};
