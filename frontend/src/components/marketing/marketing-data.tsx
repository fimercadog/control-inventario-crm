import {
  Activity,
  Building2,
  CalendarDays,
  Clock,
  Cross,
  FileText,
  FlaskConical,
  HeartPulse,
  Hospital,
  Pill,
  Scan,
  ShieldCheck,
  Siren,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  UserCheck,
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
    slug: "consulta-medica-general",
    icon: Stethoscope,
    title: "Consulta Medicina General",
    short: "Evaluación clínica integral, diagnósticos precisos y seguimiento continúo por médicos de planta.",
    description:
      "Atención médica primaria para pacientes de todas las edades. Examen físico detallado, revisión de antecedentes y emisión de órdenes médicas o derivaciones a especialidades en nuestra red de sedes.",
    bullets: [
      "Examen físico completo y toma de signos vitales",
      "Historia clínica digital unificada",
      "Expedición de fórmulas médicas e incapacidades",
      "Derivación directa a médicos especialistas",
    ],
    featured: true,
  },
  {
    slug: "pediatria-neonatologia",
    icon: HeartPulse,
    title: "Pediatría & Neonatología",
    short: "Control del desarrollo, vacunación y atención médica cálida para lactantes, niños y adolescentes.",
    description:
      "Acompañamiento médico especializado en el crecimiento y desarrollo infantil. Evaluaciones pediátricas periódicas, esquemas de vacunación y manejo de patologías pediátricas frecuentes.",
    bullets: [
      "Control de crecimiento y desarrollo pediátrico",
      "Esquema oficial de vacunación PAI",
      "Atención prioritaria pediátrica",
      "Orientación nutricional infantil",
    ],
    featured: true,
  },
  {
    slug: "laboratorio-clinico",
    icon: FlaskConical,
    title: "Laboratorio Clínico Especializado",
    short: "Toma de muestras y procesamiento de exámenes hematológicos, bioquímicos y microbiológicos con alta precisión.",
    description:
      "Laboratorio clínico automatizado con entrega rápida de resultados en línea. Procesamiento de pruebas de rutina y especializadas bajo rigurosos estándares de control de calidad.",
    bullets: [
      "Hemogramas, perfil lipídico y glicemia",
      "Pruebas hormonales y marcadores tumorales",
      "Resultados digitales en línea el mismo día",
      "Toma de muestras domiciliaria coordinada",
    ],
    featured: true,
  },
  {
    slug: "urgencias-triage",
    icon: Siren,
    title: "Atención Prioritaria / Urgencias",
    short: "Atención médica inmediata y clasificación por Triage en situaciones agudas (Configurable según habilitación).",
    description:
      "Servicio de atención prioritaria y Triage médico según la configuración de servicios habilitados del prestador.",
    bullets: [
      "Clasificación médica por Triage estándar",
      "Sala de observación y nebulizaciones",
      "Estabilización médica asistencial",
      "Remisión y coordinación de traslado",
    ],
    featured: true,
  },
  {
    slug: "cardiologia-ekg",
    icon: Activity,
    title: "Cardiología & Electrocardiografía",
    short: "Evaluación de la salud cardiovascular, electrocardiogramas y lectura especializada de hallazgos.",
    description:
      "Diagnóstico y control de hipertensión, arritmias y enfermedades cardiovasculares. Monitoreo especializado con equipos de electrocardiografía digital de última generación.",
    bullets: [
      "Electrocardiograma de 12 derivadas",
      "Control de riesgo cardiovascular",
      "Evaluación preoperatoria cardiológica",
      "Lectura e informe por cardiólogo",
    ],
    featured: true,
  },
  {
    slug: "imagenes-diagnosticas",
    icon: Scan,
    title: "Imágenes Diagnósticas & Ecografía",
    short: "Ecografía general, articular, ginecológica y radiografía digital interpretada por radiólogos.",
    description:
      "Servicio de ayuda diagnóstica no invasiva para la detección oportuna de condiciones abdominales, pélvicas, musculares y osteoarticulares.",
    bullets: [
      "Ecografía abdominal, pélvica y tiroidea",
      "Radiografía digital de alta resolución",
      "Informes radiológicos detallados",
      "Priorización de hallazgos críticos",
    ],
  },
  {
    slug: "odontologia-integral",
    icon: Smile,
    title: "Odontología & Salud Oral",
    short: "Odontología general, prevención, higiene oral y tratamientos restauradores para toda la familia.",
    description:
      "Cuidado integral de la cavidad oral: profilaxis, calzas estéticas, endodoncia básica y valoración odontológica preventiva.",
    bullets: [
      "Limpieza y profilaxis ultrasonido",
      "Operatoria y resinas estéticas",
      "Valoración preventiva y fluorización",
      "Odontopediatría",
    ],
  },
  {
    slug: "fisioterapia-rehabilitacion",
    icon: Sparkles,
    title: "Fisioterapia & Rehabilitación",
    short: "Planes de rehabilitación física, manejo del dolor muscular y recuperación postquirúrgica o traumática.",
    description:
      "Tratamiento especializado por fisioterapeutas certificados. Sesiones orientadas al alivio del dolor, reacondicionamiento motor y rehabilitación neuromuscular.",
    bullets: [
      "Rehabilitación osteomuscular y articular",
      "Manejo del dolor crónico y agudo",
      "Terapia física postquirúrgica",
      "Ejercicios terapéuticos guiados",
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
  isDemo?: boolean;
};

export const team: TeamMember[] = [
  {
    slug: "alejandro-morales",
    name: "Dr. Alejandro Morales",
    role: "Director Médico (Demo)",
    specialty: "Medicina Interna & Salud Pública",
    bio: "Experiencia en dirección asistencial, atención primaria y medicina preventiva.",
    longBio:
      "El Dr. Alejandro Morales coordina el equipo médico y la calidad asistencial de SanitasSalud IPS. Su enfoque combina el rigor de la medicina interna con un trato humano y cercano hacia cada paciente.",
    isDemo: true,
  },
  {
    slug: "natalia-cardenas",
    name: "Dra. Natalia Cárdenas",
    role: "Médica Especialista (Demo)",
    specialty: "Pediatría & Puericultura",
    bio: "Especialista en desarrollo infantil, esquemas de vacunación y nutrición en la infancia.",
    longBio:
      "La Dra. Natalia Cárdenas lidera la consulta pediátrica y los programas de promoción de la salud infantil. Apasionada por brindar consultas tranquilas y explicaciones claras a los padres.",
    isDemo: true,
  },
  {
    slug: "gabriel-restrepo",
    name: "Dr. Gabriel Restrepo",
    role: "Médico Especialista (Demo)",
    specialty: "Cardiología & Riesgo Cardiovascular",
    bio: "Especialista en electrocardiografía, ecocardiograma y control preventivo cardiovascular.",
    longBio:
      "El Dr. Gabriel Restrepo es responsable de la unidad de cardiología y diagnóstico no invasivo. Trabaja en la prevención primaria de eventos cardiovasculares mediante chequeos y monitoreo continuo.",
    isDemo: true,
  },
  {
    slug: "andrea-gomez",
    name: "Lic. Andrea Gómez",
    role: "Coordinadora de Atenciones (Demo)",
    specialty: "Gestión de Pacientes & Admisiones",
    bio: "Primer punto de contacto para agendamiento, trámites asistenciales y orientación al paciente.",
    longBio:
      "Andrea coordina las líneas de atención, admisiones y turnos de consulta. Se asegura de que cada paciente reciba atención ágil y sin complicaciones administrativas.",
    isDemo: true,
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
    name: "Carlos Eduardo Mendoza",
    pet: "Paciente en Consulta Externa (Demo)",
    text: "Excelente atención en la Sede Chicó. El Dr. Morales me atendió puntual, explicó mi diagnóstico con calma y la fórmula me llegó de inmediato al correo.",
    rating: 5,
  },
  {
    name: "María Fernanda Suárez",
    pet: "Madre de paciente pediátrico (Demo)",
    text: "Llevo a mis dos hijos con la Dra. Cárdenas para sus controles. Las instalaciones son impecables y el área pediátrica transmite mucha tranquilidad.",
    rating: 5,
  },
  {
    name: "Roberto Gómez Trujillo",
    pet: "Paciente servicio Prioritario (Demo)",
    text: "Tuve una consulta prioritaria un domingo por la noche. El proceso de Triage fue rápido, me estabilizaron en observación y salí con el tratamiento completo.",
    rating: 5,
  },
  {
    name: "Patricia Alarcón",
    pet: "Paciente de Cardiología (Demo)",
    text: "El electrocardiograma y la consulta de control me permitieron ajustar mi medicación a tiempo. Todo el personal de enfermería es sumamente profesional.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Cómo puedo agendar una cita médica en SanitasSalud IPS?",
    answer:
      "Puedes agendar directamente a través de nuestro sitio web en 'Solicitar Cita', comunicándote a nuestro PBX +57 (601) 745-9000 o por WhatsApp al +57 310 890 2020.",
  },
  {
    question: "¿Qué servicios de salud están habilitados en esta IPS?",
    answer:
      "Los servicios habilitados dependen de la configuración REPS registrada por el prestador. En el sistema demo se incluyen Consulta Externa General, Pediatría, Cardiología, Laboratorio Clínico y Atención Prioritaria.",
  },
  {
    question: "¿Cómo funciona el servicio de Triage y Consulta Prioritaria?",
    answer:
      "El servicio opera según la habilitación de la sede principal. El médico de Triage clasifica la prioridad clínica según el protocolo asistencial.",
  },
  {
    question: "¿En cuánto tiempo puedo consultar mis resultados de laboratorio?",
    answer:
      "La mayoría de los exámenes de laboratorio de rutina están disponibles el mismo día a través del Portal de Pacientes o mediante envío al correo electrónico registrado.",
  },
  {
    question: "¿Tienen servicio de vacunación y esquema PAI?",
    answer:
      "Sí, aplicamos el esquema oficial de vacunación pediátrica y de adultos, además de vacunas adicionales con registro oficial.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "+150.000", label: "atenciones médicas registradas" },
  { value: "+45", label: "médicos especialistas en red" },
  { value: "3", label: "sedes integrales de atención" },
  { value: "98.5%", label: "satisfacción de pacientes" },
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

export const blogCategories = ["Salud Preventiva", "Pediatría", "Cardiología", "Laboratorio", "Atención Prioritaria"];

export const blogPosts: BlogPost[] = [
  {
    slug: "check-up-preventivo-anual-salud",
    title: "Por qué el chequeo médico preventivo anual es tu mejor inversión en salud",
    category: "Salud Preventiva",
    excerpt: "La hipertensión, la diabetes y otras patologías suelen ser asintomáticas en sus fases iniciales. Conoce qué exámenes deberías realizarte cada año.",
    image: "/gallery/ips/consulta_medica.jpg",
    authorSlug: "alejandro-morales",
    date: "2026-09-01",
    readMinutes: 4,
    body: [
      "Muchas patologías crónicas no generan dolor ni síntomas evidentes en sus etapas tempranas. Realizar un chequeo médico preventivo anual es la herramienta fundamental de la salud pública moderna para identificar factores de riesgo y actuar a tiempo.",
      "Un chequeo integral incluye la evaluación clínica por medicina general, la medición rigurosa de la presión arterial, cálculo de índice de masa corporal y un panel básico de laboratorio (glicemia, perfil lipídico, función renal).",
      "En SanitasSalud IPS priorizamos la medicina preventiva porque reducir el riesgo de eventos mayores es el pilar de una vida longeva y saludable.",
    ],
  },
  {
    slug: "vacunacion-infantil-esquema-completo",
    title: "La importancia de mantener el esquema de vacunación infantil al día",
    category: "Pediatría",
    excerpt: "Guía clara para padres sobre cada dosis del esquema oficial y cómo protegen a los niños en sus primeros años de vida.",
    image: "/gallery/ips/hero_ips.jpg",
    authorSlug: "natalia-cardenas",
    date: "2026-08-15",
    readMinutes: 5,
    body: [
      "Las vacunas son el descubrimiento más trascendental en la historia de la pediatría. Cumplir oportunamente con las fechas del esquema oficial garantiza que los anticuerpos del niño se desarrollen antes de exponerse a patógenos severos.",
      "Es primordial no postergar las dosis de refuerzo. Cada refuerzo consolida la memoria inmunológica necesaria para proteger contra enfermedades respiratorias, virales y bacterianas.",
    ],
  },
  {
    slug: "tecnologia-diagnostica-ips-moderna",
    title: "Tecnología en Imágenes Diagnósticas y Laboratorio al Servicio del Paciente",
    category: "Laboratorio",
    excerpt: "Cómo la automatización y la digitalización de resultados reducen los tiempos de diagnóstico médico.",
    image: "/gallery/ips/urgencias_prioritaria.jpg",
    authorSlug: "gabriel-restrepo",
    date: "2026-07-20",
    readMinutes: 3,
    body: [
      "El uso de analizadores bioquímicos de última generación permite procesar muestras con márgenes de precisión excepcionales y tiempos de respuesta reducidos a pocas horas.",
      "En SanitasSalud IPS nos mantenemos a la vanguardia diagnóstica para brindar soporte confiable a las decisiones clínicas de nuestro cuerpo médico.",
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
