import {
  Activity,
  Bot,
  Brain,
  FileCheck,
  FileText,
  Headphones,
  HeartPulse,
  Shield,
  Stethoscope,
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
    slug: "registro-voz-telegram",
    icon: Headphones,
    title: "Registro Clínico por Telegram",
    short: "Dictá audios o enviá textos desde tu bot de Telegram durante o al finalizar cada atención.",
    description:
      "Diseñado para enfermeros y terapeutas en desplazamiento: abrí sesión con tu paciente en Telegram y enviá audios o mensajes de texto. CareNote captura, organiza y procesa cada segmento dentro del mismo contexto clínico.",
    bullets: [
      "Múltiples audios y mensajes por sesión",
      "Procesamiento inteligente sin límite de sesión",
      "Correlación automática por paciente y profesional",
      "Sincronización instantánea con el panel web",
    ],
    featured: true,
  },
  {
    slug: "informes-clinicos-ia",
    icon: Brain,
    title: "Informes Clínicos Automatizados",
    short: "Conversión automática de notas de voz en informes de atención estructurados.",
    description:
      "Utilizamos n8n e Inteligencia Artificial especializada para transcribir y estructurar los hallazgos clínicos, signos vitales, procedimientos aplicados y plan de cuidados de forma clara y profesional.",
    bullets: [
      "Transcripción de voz a texto con alta precisión",
      "Estructuración de nota SOAP / resumen de atención",
      "Detección de constantes vitales y alertas",
      "Exportación y revisión antes de radicar",
    ],
    featured: true,
  },
  {
    slug: "atencion-domiciliaria-enfermeria",
    icon: Stethoscope,
    title: "Gestión de Enfermería Domiciliaria",
    short: "Control de curaciones, administración de medicamentos y registro de signos vitales.",
    description:
      "Plataforma optimizada para el seguimiento continuo de pacientes en casa. Registrá la evolución de heridas, curaciones, catéteres, administración de fármacos y evolución de signos vitales.",
    bullets: [
      "Ficha de evolución y constantes vitales",
      "Registro de curaciones y procedimientos",
      "Alertas de seguimiento y notas de enfermería",
      "Historial comparativo por paciente",
    ],
    featured: true,
  },
  {
    slug: "terapias-domiciliarias",
    icon: Activity,
    title: "Terapias Domiciliarias",
    short: "Seguimiento para Fisioterapia, Terapia Respiratoria, Ocupacional y Fonoaudiología.",
    description:
      "Formatos flexibles adaptados a planes de rehabilitación física, manejo de vía aérea, terapia ocupacional y fonoaudiología domiciliaria con evaluación de logros sesión a sesión.",
    bullets: [
      "Planes de rehabilitación física y motora",
      "Evaluación y terapia respiratoria domiciliaria",
      "Evolución funcional y fonoaudiológica",
      "Indicadores de avance del tratamiento",
    ],
    featured: true,
  },
  {
    slug: "historia-clinica-pacientes",
    icon: Users,
    title: "Directorio & Expediente de Pacientes",
    short: "Ficha unificada del paciente con datos personales, cobertura y resumen de atenciones.",
    description:
      "Administrá el expediente completo del paciente domiciliario: documento de identidad, aseguradora/EPS, contacto de emergencia, antecedentes relevantes y registro de todas las sesiones realizadas.",
    bullets: [
      "Identificación clara de paciente humano",
      "Contacto de emergencia y dirección de atención",
      "Aseguradora, EPS y tipo de cobertura",
      "Acceso rápido a todas las sesiones de Telegram",
    ],
  },
  {
    slug: "consentimientos-privacidad",
    icon: Shield,
    title: "Consentimientos & Privacidad",
    short: "Manejo seguro de datos clínicos bajo regulación y aceptación de términos.",
    description:
      "Protección estricta de la información médica. Gestión de avisos de privacidad, consentimientos informados y firma de aceptación digital antes del inicio de tratamientos.",
    bullets: [
      "Aceptación digital de aviso de privacidad",
      "Consentimiento para atención y voz por Telegram",
      "Trazabilidad de auditoría de accesos",
      "Encriptación de notas y audios clínicos",
    ],
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
    slug: "maria-elena-gomez",
    name: "Lic. María Elena Gómez",
    role: "Coordinadora de Enfermería Domiciliaria",
    specialty: "Cuidado de paciente crónico y manejo de heridas",
    bio: "Más de 12 años liderando equipos de enfermería domiciliaria y optimización de notas clínicas.",
    longBio:
      "La Lic. María Elena Gómez coordina la atención domiciliaria de enfermería. Ha impulsado el uso de CareNote para que cada enfermera optimice su tiempo de reporte y mantenga el expediente clínico al día.",
  },
  {
    slug: "juan-pablo-rodriguez",
    name: "Lic. Juan Pablo Rodríguez",
    role: "Líder de Fisioterapia Domiciliaria",
    specialty: "Rehabilitación física y neuro-motora",
    bio: "Especialista en programas de terapia física a domicilio y seguimiento de evolución funcional.",
    longBio:
      "El Lic. Juan Pablo lidera el área de rehabilitación en casa. Dicta sus informes de evolución al finalizar cada sesión mediante audios de Telegram, asegurando registros inmediatos y precisos.",
  },
  {
    slug: "andres-morales",
    name: "Ing. Andrés Morales",
    role: "Especialista en Automatizaciones CareNote",
    specialty: "Integración Telegram + n8n + Modelos de IA Clínicos",
    bio: "Responsable de la infraestructura de captura por voz y generación automatizada de informes.",
    longBio:
      "Andrés diseña los flujos de automatización que conectan el bot de Telegram con los modelos de inteligencia artificial para entregar informes clínicos limpios y listos para revisión.",
  },
];

export function teamBySlug(slug: string): TeamMember | undefined {
  return team.find((t) => t.slug === slug);
}

export type Testimonial = {
  name: string;
  pet: string;
  text: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Lic. Beatriz Morales",
    pet: "Enfermera Domiciliaria",
    text: "Antes gastaba 2 horas cada noche redactando notas de enfermería. Ahora envío audios en Telegram entre paciente y paciente, y CareNote me entrega los informes listos para revisión.",
    rating: 5,
  },
  {
    name: "Lic. Carlos Restrepo",
    pet: "Fisioterapeuta Domiciliario",
    text: "Dictar la evolución de mis pacientes en audios cortitos y tener todo el historial organizado por paciente y fecha cambió por completo mi ritmo de trabajo.",
    rating: 5,
  },
  {
    name: "Dra. Sandra Patiño",
    pet: "Directora IPS Domiciliaria",
    text: "CareNote nos permitió reducir el tiempo de generación e impresión de informes para las aseguradoras de 48 horas a minutos. Es la herramienta perfecta para nuestros profesionales.",
    rating: 5,
  },
  {
    name: "Lic. Claudia Mendoza",
    pet: "Terapeuta Respiratoria",
    text: "Me encanta poder enviar varios audios en la misma sesión si la atención fue larga. CareNote los junta y arma un informe coherente sin que yo tenga que redactar nada a mano.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Cómo funciona la captura de notas por Telegram?",
    answer:
      "El profesional abre el bot de Telegram, selecciona 'Nueva sesión', escoge a su paciente e inicia la atención. A partir de allí, envía audios o textos. CareNote procesa los audios vía n8n e IA y los convierte en un informe clínico listo.",
  },
  {
    question: "¿Puedo enviar múltiples audios en una misma sesión?",
    answer:
      "Sí. El límite es por archivo de audio individual, no por sesión. Podés enviar varios audios y mensajes de texto durante una sesión de 1, 2 o más horas, y todos quedarán asociados al mismo encuentro.",
  },
  {
    question: "¿A qué profesionales está dirigido CareNote?",
    answer:
      "Está optimizado para atención domiciliaria: Enfermería, Fisioterapia, Terapia Respiratoria, Terapia Ocupacional, Fonoaudiología y médicos a domicilio.",
  },
  {
    question: "¿Cómo se accede al área administrativa?",
    answer:
      "Haciendo clic en 'Iniciar sesión' en el menú superior o ingresando a /login con tus credenciales de usuario autorizadas.",
  },
  {
    question: "¿Los datos de los pacientes están protegidos?",
    answer:
      "Sí. Cumplimos con estándares de confidencialidad de datos médicos, consentimiento informado digital y almacenamiento seguro.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "15.000+", label: "audios procesados" },
  { value: "98%", label: "ahorro en redacción" },
  { value: "< 3 min", label: "tiempo por informe" },
  { value: "4.9/5", label: "satisfacción de profesionales" },
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

export const blogCategories = ["Automatización", "Enfermería", "Terapias", "Telegram", "Informes Clínicos"];

export const blogPosts: BlogPost[] = [
  {
    slug: "menos-tiempo-escribiendo-mas-tiempo-cuidando",
    title: "Menos tiempo escribiendo. Más tiempo cuidando: La revolución del dictado por Telegram",
    category: "Automatización",
    excerpt: "Cómo el dictado por voz y la IA liberan a los profesionales de salud domiciliaria del trabajo administrativo nocturno.",
    image: "/gallery/pet-7.jpg",
    authorSlug: "maria-elena-gomez",
    date: "2026-09-10",
    readMinutes: 4,
    body: [
      "Uno de los mayores dolores de cabeza para los profesionales de salud domiciliaria es el tiempo dedicado a la redacción manual de notas clínicas al final de una larga jornada.",
      "Con CareNote, el profesional simplemente abre Telegram, inicia la sesión con el paciente y dicta audios naturales mientras realiza la atención o durante sus traslados.",
      "La plataforma procesa el audio, transcribe el contenido y genera un informe estructurado con signos vitales, intervenciones y evolución del paciente.",
    ],
  },
];

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

