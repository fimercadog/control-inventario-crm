/**
 * Configuración Centralizada de la IPS (Marca, Contacto, Sedes, Habilitación y Datos Demo).
 * Permite cambiar la marca, líneas de atención, datos de habilitación y sedes desde un solo lugar
 * sin hardcodear información en componentes de la vertical IPS.
 */

export const IPS_CONFIG = {
  // Configuración de Marca y Estado Demo
  isDemoMode: true,
  demoNoticeText: "Demo IPS · Demostración del Sistema ERP y Gestión Clínica (Datos Configurables)",

  brand: {
    name: "Demo IPS",
    shortName: "Demo IPS",
    tagline: "Institución Prestadora de Servicios de Salud · Atención Integral y Humana",
    descriptor: "Prestador de Servicios de Salud",
    accreditation: "Información institucional y servicios disponibles según la configuración institucional y habilitación aplicable",
  },

  // Estructura para datos de habilitación de prestadores de salud
  reps: {
    isDemo: true,
    notice: "Información de prestador y habilitación configurable en el ERP",
    codigoPrestador: "Configurable en ERP",
    codigoSedePrincipal: "Configurable por Sede",
    entidadTerritorial: "Secretaría de Salud / Dirección Territorial",
    estadoHabilitacion: "Configurable en ERP",
    serviciosHabilitados: [
      "Consulta Externa General",
      "Pediatría",
      "Cardiología",
      "Laboratorio Clínico",
      "Imágenes Diagnósticas",
      "Atención Prioritaria / Urgencias",
    ],
  },

  contact: {
    address: "Av. Carrera 45 # 108-20, Sede Chicó (Demo)",
    city: "Bogotá, D.C. · Colombia",
    phoneDisplay: "+57 (601) 745-9000",
    phoneRaw: "+576017459000",
    emergencyPhoneDisplay: "+57 (601) 745-9090",
    emergencyPhoneRaw: "+576017459090",
    whatsappDisplay: "+57 310 890 2020",
    whatsappRaw: "573108902020",
    email: "atencion.paciente@demoips.test",
    schedule: "Consultas Externas: Lunes a Viernes: 6:00 a 20:00 · Sábados: 7:00 a 14:00",
    scheduleEmergency: "Atención Prioritaria / Urgencias (Servicios disponibles según la configuración institucional y habilitación aplicable)",
  },

  sedes: [
    {
      id: "sede-principal",
      isDemo: true,
      name: "Sede Principal Chicó (Demo)",
      address: "Av. Carrera 45 # 108-20, Bogotá",
      phone: "+57 (601) 745-9000",
      services: "Medicina General, Especialidades, Triage, Laboratorio Central",
      badge: "Sede Principal",
    },
    {
      id: "sede-norte",
      isDemo: true,
      name: "Sede Norte Chía (Demo)",
      address: "Km 2 Variante Chía - Cajicá, Centro Médico",
      phone: "+57 (601) 745-9010",
      services: "Consulta Externa, Pediatría, Odontología, Medicina Preventiva",
      badge: "Consulta & Pediatría",
    },
    {
      id: "sede-sur",
      isDemo: true,
      name: "Sede Américas (Demo)",
      address: "Av. de las Américas # 68D-40, Bogotá",
      phone: "+57 (601) 745-9020",
      services: "Imágenes Diagnósticas, Fisioterapia & Rehabilitación, Toma de Muestras",
      badge: "Diagnóstico & Rehabilitación",
    },
  ],

  social: {
    linkedin: "https://linkedin.com/company/demo-ips",
    facebook: "https://facebook.com/demoips",
    whatsapp: "https://wa.me/573108902020?text=Hola,%20deseo%20solicitar%20una%20cita%20m%C3%A9dica%20en%20Demo%20IPS",
  },

  stats: [
    { value: "+150.000", label: "atenciones médicas registradas", isDemo: true },
    { value: "+45", label: "médicos especialistas en red", isDemo: true },
    { value: "3", label: "sedes integrales de atención", isDemo: true },
    { value: "98.5%", label: "satisfacción de pacientes", isDemo: true },
  ],
};
