import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  Code,
  Contact,
  KeyRound,
  Plug,
  Stethoscope,
  Syringe,
  Terminal,
  Warehouse,
  Webhook,
} from "lucide-react";

// NOTA: copy provisional de marketing para la vertical veterinaria. El texto
// definitivo (features reales, precios, casos) se reescribe en la pasada de
// contenido de marketing, cerca de la venta, cuando los módulos clínicos estén
// terminados. Ver docs/roadmap-veterinaria.md.

export const productPages = {
  pacientes: {
    eyebrow: "Propietarios y pacientes",
    title: "Cada mascota con su ficha y su propietario",
    description:
      "El propietario es un cliente de la clínica; cada mascota cuelga de él con especie, raza, edad, peso y microchip. Desde la ficha del propietario ves todas sus mascotas y su historial.",
    bullets: [
      "Propietarios con sus datos de contacto",
      "Pacientes con especie, raza, sexo y microchip",
      "Una mascota puede tener varios propietarios",
      "Ficha con historia clínica, vacunas y citas",
    ],
    screenshot: "/product/pipeline.png",
  },
  historiaClinica: {
    eyebrow: "Historia clínica",
    title: "Consultas SOAP que quedan en la historia del paciente",
    description:
      "Registra cada consulta con el esquema Subjetivo / Objetivo / Análisis / Plan, ligada al paciente y al veterinario. La historia clínica es dato sensible: se archiva, no se borra.",
    bullets: [
      "Consultas con esquema SOAP",
      "Peso y temperatura por visita",
      "Diagnósticos y tratamientos asociados",
      "Recetas imprimibles en PDF",
    ],
    screenshot: "/product/movimientos.png",
  },
  agenda: {
    eyebrow: "Citas y agenda",
    title: "La agenda del día por profesional y consultorio",
    description:
      "Agenda citas con paciente, propietario, servicio, profesional y box. Estados claros: programada, confirmada, atendida, no asistió, cancelada. El sitio público capta solicitudes que recepción confirma.",
    bullets: [
      "Vista de agenda por día y por profesional",
      "Cita ligada a un servicio del catálogo",
      "Estados de la cita trazables",
      "Solicitud de cita desde el sitio web",
    ],
    screenshot: "/product/dashboard.png",
  },
  vacunas: {
    eyebrow: "Vacunas y desparasitación",
    title: "Qué se aplicó, con qué lote y cuándo toca la próxima",
    description:
      "Cada aplicación queda en la historia del paciente con lote y vencimiento. Si la vacuna es un producto del inventario, descuenta stock. La lista de próximas dosis por vencer te avisa a tiempo.",
    bullets: [
      "Vacunas y desparasitaciones aplicadas",
      "Lote y vencimiento por aplicación",
      "Descuenta stock si es producto del inventario",
      "Alertas de próximas dosis por vencer",
    ],
    screenshot: "/product/reportes.png",
  },
  inventario: {
    eyebrow: "Inventario",
    title: "Medicamentos, vacunas e insumos con stock por bodega",
    description:
      "Un catálogo de productos, una o varias bodegas y una bitácora que registra cada entrada, salida y ajuste para que el inventario del sistema coincida con el físico.",
    bullets: [
      "Catálogo de productos con SKU y costo",
      "Stock por bodega",
      "Bitácora de movimientos",
      "Alertas de stock bajo",
    ],
    screenshot: "/product/stock.png",
  },
  reportes: {
    eyebrow: "Reportes clínicos",
    title: "Reportes para decidir, no solo para archivar",
    description:
      "Pacientes atendidos por período, vacunas aplicadas, ocupación de la agenda e ingresos por servicio, con exportaciones CSV y PDF por módulo.",
    bullets: [
      "Pacientes atendidos y vacunas aplicadas",
      "Ocupación de agenda por profesional",
      "Ingresos por servicio",
      "Exportaciones CSV / PDF",
    ],
    screenshot: "/product/reportes.png",
  },
} as const;

export const blogPosts = [
  {
    slug: "historia-clinica-digital",
    title: "Por qué la historia clínica de tus pacientes no puede vivir en papel",
    category: "Clínica",
    excerpt: "Contenido inicial ficticio sobre trazabilidad, continuidad de atención y respaldo de la historia clínica.",
  },
  {
    slug: "agenda-que-no-se-cae",
    title: "Una agenda veterinaria que recepción realmente puede sostener",
    category: "Agenda",
    excerpt: "Contenido inicial ficticio sobre estados de cita, no-shows y recordatorios.",
  },
  {
    slug: "vacunas-y-recordatorios",
    title: "Recordatorios de vacunas: retener clientes cuidando a sus mascotas",
    category: "Vacunas",
    excerpt: "Contenido inicial ficticio sobre calendario de vacunación y próximas dosis.",
  },
  {
    slug: "stock-de-medicamentos",
    title: "Stock de medicamentos que cuadra con lo que hay en la vitrina",
    category: "Inventario",
    excerpt: "Contenido inicial ficticio sobre bitácora de movimientos, lotes y vencimientos.",
  },
  {
    slug: "solicitud-de-cita-web",
    title: "Del formulario web a la cita agendada, sin dobles llamadas",
    category: "Portal",
    excerpt: "Contenido inicial ficticio sobre captación de solicitudes y confirmación por recepción.",
  },
  {
    slug: "reportes-de-la-clinica",
    title: "Las métricas de una clínica veterinaria que sí sirven",
    category: "Reportes",
    excerpt: "Contenido inicial ficticio sobre pacientes atendidos, ocupación de agenda e ingresos por servicio.",
  },
];

// Guias para quien USA la plataforma. Lenguaje de "como hago esto", sin jerga.
export const userDocSections = [
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    icon: Contact,
    items: [
      "Crear tu clínica",
      "Crear usuarios (veterinarios, recepción)",
      "Configurar permisos",
      "Cargar el catálogo de servicios",
      "Cargar productos y bodegas",
    ],
  },
  {
    id: "propietarios-pacientes",
    title: "Propietarios y pacientes",
    icon: Contact,
    items: [
      "Registrar un propietario",
      "Dar de alta una mascota",
      "Consultar la ficha de un paciente",
      "Ver todas las mascotas de un propietario",
    ],
  },
  {
    id: "historia-clinica",
    title: "Historia clínica",
    icon: Stethoscope,
    items: [
      "Registrar una consulta SOAP",
      "Agregar diagnósticos y tratamientos",
      "Emitir e imprimir una receta",
      "Consultar la historia de un paciente",
    ],
  },
  {
    id: "agenda",
    title: "Citas y agenda",
    icon: CalendarClock,
    items: [
      "Agendar una cita",
      "Confirmar o cancelar una cita",
      "Marcar una cita como atendida o no asistió",
      "Revisar solicitudes de cita del sitio web",
    ],
  },
  {
    id: "vacunas",
    title: "Vacunas",
    icon: Syringe,
    items: [
      "Registrar una vacuna aplicada",
      "Anotar lote y vencimiento",
      "Consultar próximas dosis por vencer",
    ],
  },
  {
    id: "inventario",
    title: "Inventario",
    icon: Warehouse,
    items: [
      "Crear productos",
      "Consultar existencias",
      "Registrar ajustes de inventario",
      "Recibir una orden de compra",
    ],
  },
  {
    id: "reportes",
    title: "Reportes",
    icon: BarChart3,
    items: [
      "Pacientes atendidos",
      "Vacunas aplicadas",
      "Ocupación de agenda",
      "Ingresos por servicio",
      "Exportar información",
    ],
  },
];

// Documentacion para quien INTEGRA o desarrolla contra la plataforma.
export const devDocSections = [
  {
    id: "api-rest",
    title: "API REST",
    icon: Code,
    items: [
      "Base URL, JSON y convenciones de la API",
      "Paginacion, busqueda y filtros por recurso",
      "Formato de errores y codigos de estado",
      "Limites de tasa (throttle) por IP",
    ],
  },
  {
    id: "autenticacion",
    title: "Autenticacion",
    icon: KeyRound,
    items: [
      "Sanctum: cookie de sesion (SPA) o token Bearer",
      "Flujo de login y cookie CSRF para el SPA",
      "Emision y revocacion de tokens de API",
      "Alcance de cada token segun permisos del rol",
    ],
  },
  {
    id: "endpoints",
    title: "Endpoints",
    icon: Plug,
    items: [
      "CRUD estandar por recurso (propietarios, pacientes, citas, consultas, productos)",
      "Solicitud de cita sin auth: POST /api/public/appointments",
      "Subida de imagen de paciente: POST /api/patients/{id}/photo",
      "Vista de próximas vacunas por vencer",
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks e integraciones",
    icon: Webhook,
    items: [
      "Webhooks salientes (cita confirmada, vacuna por vencer) — en el roadmap",
      "Sincronizacion con contabilidad o facturación electrónica",
      "Recordatorios por WhatsApp / email",
      "Integraciones a medida bajo pedido",
    ],
  },
  {
    id: "ejemplos",
    title: "Ejemplos",
    icon: Terminal,
    items: [
      "curl: autenticarse y listar pacientes",
      "Crear una cita y registrar la consulta end to end",
      "Coleccion de Postman / Insomnia",
      "Snippets en JavaScript y PHP",
    ],
  },
];
