import {
  Compass,
  Globe,
  Hotel,
  MapPin,
  Plane,
  ShieldCheck,
  Ship,
  Sparkles,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  short: string;
  description: string;
  bullets: string[];
  featured?: boolean;
};

export const services: Service[] = [
  {
    slug: "paquetes-turisticos",
    icon: Globe,
    title: "Paquetes Turísticos Todo Incluido",
    short: "Planes vacacionales con tiquetes, hoteles, traslados y experiencias guiadas.",
    description:
      "Diseñamos paquetes turísticos completos a destinos nacionales e internacionales. Incluyen tiquetes aéreos, alojamiento de calidad, asistencia en destino y tours programados para que disfrutes sin preocupaciones.",
    bullets: [
      "Vuelos redondos y equipaje incluido",
      "Hoteles seleccionados de 4 y 5 estrellas",
      "Traslados aeropuerto - hotel - aeropuerto",
      "Tours guiados en español con entradas incluidas",
    ],
    featured: true,
  },
  {
    slug: "tiquetes-aereos",
    icon: Plane,
    title: "Reserva de Tiquetes Aéreos",
    short: "Vuelos nacionales e internacionales con las mejores aerolíneas comerciales.",
    description:
      "Buscamos y reservamos tus tiquetes aéreos con tarifas preferenciales, selección de asientos, equipaje adicional y soporte prioritario ante cambios de itinerarios.",
    bullets: [
      "Conexiones optimizadas y mejores escalas",
      "Asistencia en reprogramaciones y cambios",
      "Gestión de equipaje de bodega y cabina",
      "Check-in anticipado y selección de asientos",
    ],
    featured: true,
  },
  {
    slug: "hoteles-alojamiento",
    icon: Hotel,
    title: "Reserva de Hoteles & Resort",
    short: "Alojamiento en resorts de lujo, hoteles boutique y villas privadas.",
    description:
      "Contamos con convenios directos con las principales cadenas hoteleras del mundo. Te garantizamos tarifas exclusivas, desayunos incluidos y beneficios adicionales como early check-in.",
    bullets: [
      "Resorts All-Inclusive en el Caribe y destinos de playa",
      "Hoteles boutique céntricos en capitales mundiales",
      "Upgrades de habitación según disponibilidad",
      "Cancelación flexible en hospedaje seleccionado",
    ],
    featured: true,
  },
  {
    slug: "tours-guiados",
    icon: Compass,
    title: "Tours Exclusivos & Guías Locales",
    short: "Excursiones privadas y grupales con guías expertos bilingües.",
    description:
      "Vive cada destino como un habitante local. Ofrecemos tours privados o grupales pequeños a sitios históricos, parques naturales y rutas gastronómicas con guías certificados.",
    bullets: [
      "Entradas prioritarias sin filas a monumentos",
      "Guías turísticos profesionales bilingües",
      "Tours gastronómicos y culturales personalizados",
      "Transporte privado y seguro de excursión",
    ],
    featured: false,
  },
  {
    slug: "seguro-viajero",
    icon: ShieldCheck,
    title: "Seguro & Asistencia al Viajero",
    short: "Protección integral médica, equipaje y cancelación de viaje 24/7.",
    description:
      "Viaja con total tranquilidad. Ofrecemos asistencia médica internacional con cobertura médica completa, seguro por pérdida de equipaje, retraso de vuelos y cancelación con reembolso.",
    bullets: [
      "Asistencia médica de emergencia 24/7 en español",
      "Cobertura por cancelación e interrupción de viaje",
      "Indemnización por pérdida o retraso de equipaje",
      "Cumplimiento de requisitos de visado y Schengen",
    ],
    featured: false,
  },
  {
    slug: "cruceros-experiencias",
    icon: Ship,
    title: "Cruceros & Expediciones Marítimas",
    short: "Viajes en crucero por el Caribe, Mediterráneo y Fiordos.",
    description:
      "Reserva tus cruceros con las principales navieras del mundo. Disfruta de gastronomía de clase mundial, entretenimientos a bordo y excursiones en múltiples puertos de escala.",
    bullets: [
      "Cabinas con balcón y suites ejecutivas",
      "Paquetes de bebidas y cenas de especialidad",
      "Excursiones terrestres reservadas con anticipación",
      "Crédito a bordo de regalo en salidas seleccionadas",
    ],
    featured: false,
  },
];

export const featuredServices = services.filter((s) => s.featured);

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  longBio: string;
};

export const team: TeamMember[] = [
  {
    slug: "carlos-medina",
    name: "Carlos Medina",
    role: "Director de Operaciones Turísticas",
    specialty: "Planificación de viajes grupales e itinerarios a medida",
    bio: "Más de 15 años diseñando itinerarios de viaje inolvidables y coordinando alianzas internacionales.",
    longBio:
      "Carlos Medina lidera el equipo de operaciones turísticas en Viajes Globales. Se especializa en armar rutas complejas con múltiples destinos, trenes y vuelos, garantizando una logística perfecta para familias y grupos corporativos.",
  },
  {
    slug: "laura-pena",
    name: "Laura Peña",
    role: "Especialista en Destinos Internacionales",
    specialty: "Europa, Asia, África y Medio Oriente",
    bio: "Experta en itinerarios a Europa y destinos exóticos con experiencias culturales exclusivas.",
    longBio:
      "Laura Peña se dedica a asesorar viajeros en destinos de larga distancia. Diseña experiencias gastronómicas, accesos VIP a museos y hospedajes con encanto local en las principales capitales del mundo.",
  },
  {
    slug: "marcela-duarte",
    name: "Marcela Duarte",
    role: "Asesora Senior de Viajes & Experiencias",
    specialty: "Lunas de miel, resorts todo incluido y cruceros",
    bio: "Especialista en vacaciones de playa, lunas de miel y paquetes familiares con atención personalizada.",
    longBio:
      "Marcela Duarte coordina las reservas de cruceros y resorts de playa. Es el primer punto de contacto para quienes buscan unas vacaciones románticas o de descanso total sin preocuparse por la logística.",
  },
];

export function teamBySlug(slug: string): TeamMember | undefined {
  return team.find((t) => t.slug === slug);
}

export type Testimonial = {
  name: string;
  pet?: string;
  detail?: string;
  text: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Familia Morales Cárdenas",
    detail: "Viajeros a Madrid, París y Roma",
    text: "El itinerario a Europa que preparó Viajes Globales superó todas nuestras expectativas. Todo estuvo coordinado al milímetro: tiquetes, trenes, hoteles y tours guiados.",
    rating: 5,
  },
  {
    name: "Andrés & Valentina Gómez",
    detail: "Luna de Miel en Cancún",
    text: "Excelente servicio de la agencia. Nos asesoraron en cada detalle de nuestras vacaciones en Cancún con resort Todo Incluido. ¡Volveremos a viajar con ustedes sin duda!",
    rating: 5,
  },
  {
    name: "Gabriel Restrepo",
    detail: "Crucero por el Caribe Sur",
    text: "Comprar nuestro crucero por el Caribe con Viajes Globales fue súper fácil. Los pagos en cuotas y la asistencia de viaje nos dieron total tranquilidad.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Con cuánto tiempo de anticipación debo reservar mi paquete de viaje?",
    answer:
      "Recomendamos reservar con 60 a 90 días de anticipación para destinos internacionales y 30 a 45 días para vuelos y hoteles nacionales, asegurando mejores tarifas y cupos disponibles.",
  },
  {
    question: "¿Puedo pagar mi viaje en cuotas mensuales antes de la fecha de salida?",
    answer:
      "Sí. Ofrecemos planes de abonos flexibles donde puedes separar tu cupo con un anticipo inicial e ir pagando el saldo en cuotas mensuales hasta 15 días antes del viaje.",
  },
  {
    question: "¿Qué incluye el seguro de asistencia médica al viajero?",
    answer:
      "Incluye atención médica de emergencia en clínicas del destino, medicamentos recetados, repatriación sanitaria, indemnización por equipaje demorado y cobertura ante cancelación por causas de fuerza mayor.",
  },
  {
    question: "¿Ustedes gestionan el trámite de visado si mi destino lo requiere?",
    answer:
      "Sí. Te brindamos asesoría completa y cartas de confirmación de reserva (vuelos y hoteles) para la solicitud de visados en embajadas y consulados.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "+12,500", label: "viajeros satisfechos" },
  { value: "48", label: "destinos internacionales" },
  { value: "99.4%", label: "calificación de experiencia" },
  { value: "15+", label: "años de trayectoria turística" },
];

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  authorSlug: string;
  date: string;
  readMinutes: number;
  body: string[];
};

export const blogCategories = ["Destinos", "Consejos de Viaje", "Europa", "Caribe", "Cruceros", "Requisitos"];

export const blogPosts: BlogPost[] = [
  {
    slug: "guia-para-viajar-a-europa-por-primera-vez",
    title: "Guía esencial para planear tu primer viaje a Europa",
    category: "Europa",
    excerpt: "Requisitos de entrada, seguro ETIAS/Schengen, mejor época para viajar y cómo armar un itinerario inteligente.",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800",
    authorSlug: "laura-pena",
    date: "2026-08-12",
    readMinutes: 5,
    body: [
      "Planear un viaje a Europa por primera vez es emocionante pero exige una organización logística adecuada: decidir qué ciudades visitar, cómo desplazarse entre países y qué documentos llevar en regla.",
      "El primer paso es elegir una ruta coherente. Intentar abarcar demasiados países en dos semanas suele provocar agotamiento. Recomendamos seleccionar 3 o 4 ciudades principales conectadas por trenes de alta velocidad (como Madrid, Barcelona, París o Roma).",
      "Asegúrate de contar con pasaporte vigente con al menos 6 meses de validez desde la fecha de regreso, seguro de asistencia médica con cobertura mínima exigida por el Espacio Schengen y reservas confirmadas de tiquetes de regreso y hoteles.",
      "Comprar las entradas a atracciones icónicas (como la Torre Eiffel, el Coliseo Romano o la Sagrada Familia) con semanas de anticipación evita perder horas en filas y garantiza tu ingreso en el horario seleccionado.",
    ],
  },
  {
    slug: "los-mejores-resorts-all-inclusive-del-caribe",
    title: "Top 5 destinos All-Inclusive para tus vacaciones en la playa",
    category: "Caribe",
    excerpt: "Cancún, Punta Cana, Aruba y Riviera Maya: consejos para elegir la mejor época y el resort perfecto.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    authorSlug: "marcela-duarte",
    date: "2026-07-28",
    readMinutes: 4,
    body: [
      "El concepto Todo Incluido es la mejor opción para unas vacaciones de descanso absoluto. Gastronomía ilimitada, cócteles frente al mar, deportes acuáticos y entretenimiento nocturno sin gastos adicionales en el destino.",
      "Cancún y Riviera Maya destacan por sus playas de agua turquesa, acceso a parques ecológicos como Xcaret y cenotes sagrados. Punta Cana ofrece playas extensas bordeadas de cocoteros y resorts familiares de gran escala.",
      "Para viajar con niños, busca resorts con parque acuático y club infantil supervisado. Para escapadas en pareja o lunas de miel, los hoteles 'Solo Adultos' brindan ambientes tranquilos con restaurantes gourmet a la carta.",
      "Recomendamos reservar tu paquete con anticipación para asegurar habitaciones con vista al mar y acceder a promociones de niños gratis o transfers privados sin costo adicional.",
    ],
  },
];

export const recentPosts = blogPosts.slice(0, 3);

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.category === post.category ? -1 : 0) - (b.category === post.category ? -1 : 0))
    .slice(0, limit);
}

export function adjacentPosts(post: BlogPost): { prev: BlogPost | null; next: BlogPost | null } {
  const i = blogPosts.findIndex((p) => p.slug === post.slug);
  return {
    prev: i > 0 ? blogPosts[i - 1] : null,
    next: i < blogPosts.length - 1 ? blogPosts[i + 1] : null,
  };
}
