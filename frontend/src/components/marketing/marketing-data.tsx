import {
  Activity,
  Award as TrophyIcon,
  Shirt,
  Smile,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

// Contenido marketing de la vertical Escuela de Fútbol & Cantera Deportiva.
// Nombres y roles coinciden con el dataset sembrado en el backend (`DatabaseSeeder.php`:
// "Escuela de Fútbol La Cantera", Prof. Javier Morales, Profe Mateo Ríos, Lic. Sofía Gómez).

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
    slug: "sub-8-semillero",
    icon: Sparkles,
    title: "Sub-8 Semillero Cantera",
    short: "Desarrollo psicomotriz, fundamentos técnicos y juego recreativo de 6 a 8 años.",
    description:
      "Nuestra categoría Semillero introduce a los más pequeños en los fundamentos del fútbol mediante dinámicas lúdicas, desarrollo de coordinación psicomotora y trabajo en equipo en un ambiente divertido y seguro.",
    bullets: [
      "Coordinación motriz y agilidad",
      "Fundamentos de conducción y pase",
      "Formatos de juego reducido 5v5",
      "Entrenadores especializados en iniciación",
    ],
    featured: true,
  },
  {
    slug: "sub-12-iniciacion",
    icon: Activity,
    title: "Sub-12 Formación Deportiva",
    short: "Técnica individual, conceptos tácticos básicos y disciplina de 9 a 12 años.",
    description:
      "Enfocados en perfeccionar la técnica de golpeo, perfilamiento, toma de decisiones en espacio reducido y los principios básicos del posicionamiento táctico en terreno de juego.",
    bullets: [
      "Perfeccionamiento de pase y recepción",
      "Táctica individual defensiva y ofensiva",
      "Torneos locales y festivales deportivos",
      "Preparación física acorde a la edad",
    ],
    featured: true,
  },
  {
    slug: "sub-15-torneo-liga",
    icon: TrophyIcon,
    title: "Sub-15 Competición de Liga",
    short: "Competición oficial de liga, preparación física y táctica avanzada de 13 a 15 años.",
    description:
      "Categoría competitiva orientada al alto rendimiento y participación en torneos oficiales de liga. Trabajo táctico avanzado por líneas, resistencia física y preparación mental deportiva.",
    bullets: [
      "Sistemas de juego 11v11",
      "Preparación física de alto rendimiento",
      "Seguimiento estadístico por partido",
      "Participación en Torneo de Liga oficial",
    ],
    featured: true,
  },
  {
    slug: "femenino-juvenil",
    icon: Smile,
    title: "Femenino Juvenil Competición",
    short: "Formación y alto rendimiento deportivo para jugadoras de 12 a 17 años.",
    description:
      "Programa integral de fútbol femenino diseñado para desarrollar el talento técnico, acondicionamiento físico y liderazgo en jugadoras jóvenes competitivas.",
    bullets: [
      "Metodología táctica especializada",
      "Preparación física integral",
      "Torneos femeninos interclubes",
      "Cuerpo técnico certificado",
    ],
    featured: true,
  },
  {
    slug: "entrenamiento-arqueros",
    icon: Users,
    title: "Escuela Específica de Arqueros",
    short: "Entrenamiento especializado para guardametas de todas las categorías.",
    description:
      "Sesiones exclusivas para porteros enfocadas en agarre, blocaje, estiradas, juego con los pies, achiques y posicionamiento táctico dentro del área.",
    bullets: [
      "Técnica de caídas y blocajes",
      "Juego con los pies y salida",
      "Reflejos y toma de decisiones",
      "Preparación mental de partidos",
    ],
    featured: false,
  },
  {
    slug: "tienda-uniformes-indumentaria",
    icon: Shirt,
    title: "Uniformes e Indumentaria Oficial",
    short: "Kits de entrenamiento, competencia y accesorios para todos nuestros deportistas.",
    description:
      "Garantizamos la identidad de nuestra escuela brindando kits de alta calidad que incluyen camiseta, pantaloneta, medias y prendas térmicas para competencia y entrenamiento.",
    bullets: [
      "Kit oficial de entrenamiento y competencia",
      "Textiles deportivos de alta durabilidad",
      "Personalización de número y apellido",
      "Gestión de tallaje integrada en la matrícula",
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
    slug: "javier-morales",
    name: "Prof. Javier Morales",
    role: "Director Técnico & Fundador",
    specialty: "Licenciado en Educación Física, Entrenador Licencia A UEFA/FCF",
    bio: "Más de 15 años liderando procesos de formación deportiva y desarrollo de jóvenes talentos.",
    longBio:
      "El Prof. Javier Morales lidera la dirección metodológica de la escuela. Su enfoque combina la disciplina deportiva con la formación en valores, asegurando que cada atleta desarrolle su máximo potencial físico, técnico y humano.",
  },
  {
    slug: "mateo-rios",
    name: "Profe Mateo Ríos",
    role: "Preparador Físico & Entrenador Cantera",
    specialty: "Acondicionamiento físico juvenil y prevención de lesiones",
    bio: "Especialista en biotipo deportivo juvenil y metodologías de alta intensidad adaptadas.",
    longBio:
      "El Profe Mateo se encarga del acondicionamiento físico de las categorías Sub-12 a Sub-17. Supervisa las mediciones antropométricas, rutinas de velocidad y agilidad, y planes de prevención de lesiones musculares.",
  },
  {
    slug: "sofia-gomez",
    name: "Lic. Sofía Gómez",
    role: "Coordinadora de Admisiones & Cartera",
    specialty: "Gestión de matrículas, atención a acudientes y recaudo",
    bio: "Encargada de la atención a padres de familia, control de mensualidades y admisiones.",
    longBio:
      "Sofía coordina los procesos de inscripción, seguimiento de mensualidades y comunicación directa con los acudientes a través del sistema ERP y WhatsApp institucional.",
  },
];

export function teamBySlug(slug: string): TeamMember | undefined {
  return team.find((t) => t.slug === slug);
}

export type Testimonial = {
  name: string;
  pet: string; // Acudiente / Categoría
  text: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Carlos Eduardo Mendoza",
    pet: "Padre de Mateo (Categoría Sub-12)",
    text: "Excelente metodología. Mateo ha mejorado notablemente su disciplina, estado físico y trabajo en equipo desde que ingresó a La Cantera.",
    rating: 5,
  },
  {
    name: "Andrea Gutiérrez",
    pet: "Madre de Lucía (Femenino Sub-15)",
    text: "El nivel competitivo y la calidad del cuerpo técnico son excepcionales. Las chicas participan en torneos oficiales con un acompañamiento impecable.",
    rating: 5,
  },
  {
    name: "Roberto Gómez",
    pet: "Padre de Samuel (Sub-8 Semillero)",
    text: "Mi hijo ama ir a los entrenamientos. Los profesores tienen una paciencia única para enseñar los fundamentos jugando.",
    rating: 5,
  },
  {
    name: "Juliana Ospina",
    pet: "Acudiente de Tomás (Sub-15)",
    text: "El sistema ERP nos permite pagar la mensualidad y consultar la asistencia en línea sin complicaciones. Muy profesional todo el club.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Cuáles son los requisitos para inscribir a un nuevo alumno?",
    answer:
      "Se requiere documento de identidad del alumno y acudiente, certificado médico de aptitud física para alto rendimiento y completar el formulario de inscripción en línea o presencial.",
  },
  {
    question: "¿Cómo funciona el pago de matrículas y mensualidades?",
    answer:
      "La matrícula incluye la inscripción anual y la asignación del kit oficial de uniforme. Las mensualidades se cancelan durante los primeros 5 días de cada mes mediante transferencia, tarjeta o efectivo.",
  },
  {
    question: "¿Qué días y en qué horarios entrenan las categorías?",
    answer:
      "Los entrenamientos se realizan 3 veces por semana (Lunes, Miércoles y Viernes o Martes, Jueves y Sábados) en horarios matutinos y vespertinos según la categoría.",
  },
  {
    question: "¿Los alumnos participan en torneos oficiales?",
    answer:
      "Sí, las categorías Sub-10 a Sub-17 participan en la Liga Oficial de Fútbol y torneos zonales interclubes con acompañamiento médico y técnico.",
  },
  {
    question: "¿Qué incluye el kit de uniforme de la escuela?",
    answer:
      "El kit oficial incluye camiseta de entrenamiento, camiseta de competencia, pantaloneta, medias deportivas y tula de la escuela.",
  },
  {
    question: "¿Puedo agendar una clase de prueba antes de inscribir a mi hijo?",
    answer:
      "¡Claro que sí! Ofrecemos una clase de evaluación gratuita para que el aspirante conozca el grupo y el profesor evalúe su categoría correspondiente.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "10+", label: "años formando talentos" },
  { value: "450+", label: "alumnos activos en cantera" },
  { value: "14", label: "títulos de liga alcanzados" },
  { value: "100%", label: "entrenadores certificados FCF" },
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

export const blogCategories = ["Nutrición", "Táctica", "Preparación Física", "Formación", "Entrenamiento"];

export const blogPosts: BlogPost[] = [
  {
    slug: "nutricion-deportiva-en-jovenes-futbolistas",
    title: "Nutrición clave para un joven futbolista antes y después del partido",
    category: "Nutrición",
    excerpt: "Guía práctica de alimentación e hidratación para optimizar el rendimiento y acelerar la recuperación física en canteranos.",
    image: "/gallery/soccer-1.jpg",
    authorSlug: "mateo-rios",
    date: "2026-08-20",
    readMinutes: 4,
    body: [
      "La nutrición en el fútbol formativo es el combustible fundamental para el desarrollo musculoesquelético y el rendimiento deportivo durante la semana de entrenamientos y partidos oficiales.",
      "Antes del partido, se recomienda una ingesta rica en carbohidratos de absorción compleja (arroz integral, avena, pasta) consumidos entre 2 y 3 horas antes de saltar a la cancha.",
      "La hidratación constante con electrolitos antes, durante y después del juego previene calambres y mantiene la agilidad mental en momentos decisivos del partido.",
    ],
  },
  {
    slug: "la-importancia-de-la-tecnica-individual",
    title: "Por qué la técnica individual se debe pulir antes de los 12 años",
    category: "Formación",
    excerpt: "El control orientado, el perfilamiento y el pase corto como cimientos del futbolista moderno.",
    image: "/gallery/soccer-2.jpg",
    authorSlug: "javier-morales",
    date: "2026-07-15",
    readMinutes: 5,
    body: [
      "Entre los 6 y los 12 años, el cerebro de los niños presenta una plasticidad neuromuscular ideal para la adquisición de patrones técnicos automatizados.",
      "En La Cantera enfatizamos el trabajo repetitivo consciente del control orientado con ambos perfiles, permitiendo que el jugador resuelva situaciones complejas en espacios reducidos.",
      "Un jugador con una técnica depurada toma decisiones más rápidas y sufre menos desgaste físico durante la competencia.",
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
