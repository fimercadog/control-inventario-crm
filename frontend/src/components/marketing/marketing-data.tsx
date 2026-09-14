import {
  Activity,
  Bone,
  Cross,
  FlaskConical,
  HeartPulse,
  Scissors,
  Scan,
  Siren,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

// Contenido demo de la vertical veterinaria. Nombres y roles coinciden con el
// dataset sembrado en el backend (`DatabaseSeeder.php`: "Clínica Veterinaria
// Los Andes", Dr. Carlos Medina, Dra. Laura Peña, Marcela Duarte) para que el
// sitio público y el panel cuenten la misma historia. Listo para reemplazar
// por la información real de la clínica antes de vender/desplegar.

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
    slug: "consulta-veterinaria",
    icon: Stethoscope,
    title: "Consulta veterinaria",
    short: "Revisión general, diagnóstico y seguimiento con un veterinario de planta.",
    description:
      "La consulta general es la puerta de entrada a la atención de tu mascota: examen físico completo, revisión de peso y signos vitales, y una conversación honesta sobre lo que necesita. Queda registrada en su historia clínica para que cada visita siguiente parta de donde quedó la anterior.",
    bullets: [
      "Examen físico completo y control de peso",
      "Historia clínica digital por paciente",
      "Orientación sobre alimentación y cuidados",
      "Derivación a especialista si el caso lo requiere",
    ],
    featured: true,
  },
  {
    slug: "vacunacion",
    icon: Syringe,
    title: "Vacunación",
    short: "Esquemas de vacunación al día, con recordatorio de la próxima dosis.",
    description:
      "Aplicamos los esquemas de vacunación recomendados para perros y gatos según edad y estilo de vida, y dejamos registrado el lote y la fecha exacta para avisarte cuándo toca la próxima dosis, sin que se te pase.",
    bullets: [
      "Polivalente, antirrábica y triple felina",
      "Lote y vencimiento registrados por aplicación",
      "Recordatorio de la próxima dosis",
      "Carné de vacunación disponible en cada visita",
    ],
    featured: true,
  },
  {
    slug: "desparasitacion",
    icon: Bone,
    title: "Desparasitación",
    short: "Control interno y externo, con calendario según peso y edad.",
    description:
      "La desparasitación interna y externa es preventiva: protege a tu mascota y a tu familia. Definimos el producto y la frecuencia según peso, edad y estilo de vida, y lo dejamos anotado en su historia para el próximo control.",
    bullets: ["Desparasitación interna y externa", "Dosis según peso y edad", "Calendario de refuerzos", "Seguro para cachorros y gatitos"],
  },
  {
    slug: "medicina-preventiva",
    icon: HeartPulse,
    title: "Medicina preventiva",
    short: "Chequeos periódicos para detectar a tiempo lo que todavía no duele.",
    description:
      "Un chequeo preventivo anual (o semestral en pacientes senior) detecta cambios antes de que se conviertan en un problema serio: peso, dentadura, piel, corazón y un panel básico de laboratorio si hace falta.",
    bullets: ["Chequeo anual o semestral", "Panel de laboratorio preventivo", "Plan de salud por etapa de vida", "Seguimiento de pacientes senior"],
    featured: true,
  },
  {
    slug: "laboratorio-clinico",
    icon: FlaskConical,
    title: "Laboratorio clínico",
    short: "Análisis de sangre, orina y heces con resultados el mismo día.",
    description:
      "Contamos con laboratorio propio para los análisis más frecuentes, lo que agiliza el diagnóstico en consultas de urgencia y en el seguimiento de tratamientos en curso.",
    bullets: ["Hemograma y química sanguínea", "Uroanálisis y coproanálisis", "Resultados el mismo día en la mayoría de los casos", "Interpretación con tu veterinario tratante"],
  },
  {
    slug: "cirugia",
    icon: Scissors,
    title: "Cirugía",
    short: "Cirugías de tejidos blandos y esterilización con protocolo anestésico seguro.",
    description:
      "Desde esterilizaciones de rutina hasta cirugías de tejidos blandos, trabajamos con protocolo anestésico monitoreado y control post-operatorio hasta el alta.",
    bullets: ["Esterilización canina y felina", "Cirugía de tejidos blandos", "Monitoreo anestésico", "Control post-operatorio incluido"],
    featured: true,
  },
  {
    slug: "odontologia-veterinaria",
    icon: Smile,
    title: "Odontología veterinaria",
    short: "Profilaxis dental bajo anestesia para frenar la enfermedad periodontal.",
    description:
      "La enfermedad periodontal es una de las causas más comunes de dolor crónico no diagnosticado en mascotas adultas. La profilaxis dental bajo anestesia controlada, con limpieza y pulido, la previene y trata.",
    bullets: ["Profilaxis y limpieza bajo anestesia", "Extracciones cuando son necesarias", "Evaluación del estado dental en cada consulta", "Recomendaciones de higiene en casa"],
  },
  {
    slug: "hospitalizacion",
    icon: Cross,
    title: "Hospitalización",
    short: "Internación con monitoreo para pacientes que necesitan observación.",
    description:
      "Para pacientes que requieren fluidoterapia, medicación continua u observación post-quirúrgica, contamos con área de hospitalización con seguimiento por el equipo veterinario.",
    bullets: ["Fluidoterapia y medicación continua", "Observación post-quirúrgica", "Reportes de evolución al propietario", "Alta coordinada con tu veterinario"],
  },
  {
    slug: "urgencias",
    icon: Siren,
    title: "Urgencias",
    short: "Atención prioritaria para las situaciones que no pueden esperar.",
    description:
      "Ante un accidente, una intoxicación o un cuadro que empeora rápido, la prioridad es estabilizar. Llamanos antes de venir para que el equipo esté listo cuando llegues.",
    bullets: ["Atención prioritaria sin cita previa", "Estabilización y manejo del dolor", "Línea directa para casos urgentes", "Derivación si el caso supera nuestra capacidad"],
    featured: true,
  },
  {
    slug: "nutricion",
    icon: Activity,
    title: "Nutrición",
    short: "Planes de alimentación por etapa de vida o condición clínica.",
    description:
      "La nutrición es parte del tratamiento, no un accesorio: acompañamos con planes de alimentación para cachorros, adultos, pacientes senior o con condiciones específicas como renal, digestiva o de control de peso.",
    bullets: ["Plan nutricional por etapa de vida", "Dietas terapéuticas (renal, digestiva, peso)", "Seguimiento de peso en cada visita", "Recomendación de marca y porción"],
  },
  {
    slug: "diagnostico-por-imagen",
    icon: Scan,
    title: "Diagnóstico por imagen",
    short: "Radiografía y ecografía para ver lo que el examen físico no alcanza.",
    description:
      "Cuando el examen físico y el laboratorio no bastan, la imagenología ayuda a confirmar un diagnóstico: fracturas, cuerpos extraños, patologías abdominales o cardíacas.",
    bullets: ["Radiografía digital", "Ecografía abdominal", "Informe interpretado por el veterinario tratante", "Coordinación con cirugía si el caso lo requiere"],
  },
  {
    slug: "peluqueria-grooming",
    icon: Sparkles,
    title: "Peluquería / grooming",
    short: "Baño y corte de higiene, ideal para combinar con la consulta.",
    description:
      "Baño medicado o de rutina, corte de higiene y limpieza de oídos, a cargo de personal capacitado. Se puede combinar con la consulta para aprovechar la misma visita.",
    bullets: ["Baño de rutina o medicado", "Corte de higiene", "Limpieza de oídos", "Ideal para combinar con la consulta"],
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
    name: "Dr. Carlos Medina",
    role: "Médico veterinario",
    specialty: "Medicina general y cirugía de tejidos blandos",
    bio: "Más de 10 años atendiendo perros y gatos, con especial interés en medicina preventiva y cirugía.",
    longBio:
      "El Dr. Carlos Medina lidera la consulta general y el área quirúrgica de la clínica. Cree que la mejor cirugía es la que se evita con un buen chequeo preventivo a tiempo, y dedica parte de cada consulta a explicarle al propietario qué está viendo y por qué.",
  },
  {
    slug: "laura-pena",
    name: "Dra. Laura Peña",
    role: "Médica veterinaria",
    specialty: "Medicina interna y diagnóstico por imagen",
    bio: "Se enfoca en casos de medicina interna, laboratorio y diagnóstico por imagen.",
    longBio:
      "La Dra. Laura Peña se especializa en medicina interna: los casos que necesitan laboratorio, ecografía y seguimiento cercano. Trabaja de la mano con el propietario para que el plan de tratamiento sea claro y sostenible en casa.",
  },
  {
    slug: "marcela-duarte",
    name: "Marcela Duarte",
    role: "Coordinadora de recepción",
    specialty: "Agenda, urgencias y atención al propietario",
    bio: "El primer contacto de la clínica: agenda tu cita, resuelve dudas y coordina las urgencias.",
    longBio:
      "Marcela coordina la recepción y la agenda de la clínica. Es quien contesta el WhatsApp, confirma tu cita y prioriza una urgencia en cuanto entra. Si no sabés por dónde empezar, empezá por ella.",
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
    name: "Camila Herrera",
    pet: "dueña de Luna (golden retriever)",
    text: "Llevamos a Luna desde cachorra. Siempre nos explican todo antes de hacer cualquier procedimiento, y el seguimiento de las vacunas nos salvó más de un olvido.",
    rating: 5,
  },
  {
    name: "Andrés Vargas",
    pet: "dueño de Michi (gata)",
    text: "Michi es súper arisca en el veterinario y acá tienen una paciencia increíble. La cirugía de esterilización fue impecable, con controles post-operatorios muy claros.",
    rating: 5,
  },
  {
    name: "Marcela Ríos",
    pet: "dueña de Kiara",
    text: "Un fin de semana Kiara se lastimó una pata y nos atendieron de urgencia sin drama. Desde entonces no la llevamos a otro lado.",
    rating: 5,
  },
  {
    name: "Felipe Castaño",
    pet: "dueño de Toby y Rocco",
    text: "Tengo dos perros con esquemas de vacunación distintos y nunca se me confunden las fechas: siempre me avisan a tiempo.",
    rating: 5,
  },
  {
    name: "Diana Torres",
    pet: "dueña de Nina",
    text: "Nina es una perrita senior y el chequeo preventivo semestral nos ha permitido llegar a tiempo a un par de cosas que ni notábamos.",
    rating: 4,
  },
  {
    name: "Juan David Peláez",
    pet: "dueño de Zeus",
    text: "La profilaxis dental de Zeus le cambió el aliento y, según el veterinario, le evitó un dolor que ni sabíamos que tenía.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Necesito pedir cita o puedo llegar directamente?",
    answer:
      "Para consultas de rutina recomendamos agendar cita (por el sitio, WhatsApp o teléfono) para no hacerte esperar. Las urgencias se atienden siempre, con o sin cita previa.",
  },
  {
    question: "¿Qué hago si es una urgencia fuera de horario?",
    answer:
      "Escribinos por WhatsApp o llamá a la línea de la clínica. Te vamos a indicar si podemos recibirte de inmediato o coordinar la atención más cercana.",
  },
  {
    question: "¿Cómo es la primera consulta de mi mascota?",
    answer:
      "Empezamos con una historia clínica completa: antecedentes, alimentación y estilo de vida, seguido de un examen físico general. Si trae vacunas previas, llevá el carné.",
  },
  {
    question: "¿Con qué frecuencia hay que vacunar?",
    answer:
      "Depende de la vacuna y la edad: los cachorros y gatitos llevan un esquema inicial de varias dosis, y luego refuerzos anuales. Nosotros llevamos el registro y te avisamos cuándo toca.",
  },
  {
    question: "¿Atienden otras especies además de perros y gatos?",
    answer:
      "Sí, también atendemos aves, conejos y algunos exóticos. Si no estás seguro, escribinos antes con el caso puntual.",
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer: "Efectivo, tarjeta débito/crédito y transferencia. Para procedimientos mayores entregamos presupuesto por escrito antes de proceder.",
  },
  {
    question: "¿Necesito ayuno antes de una cirugía?",
    answer:
      "Sí. Para cualquier procedimiento con anestesia te vamos a indicar el ayuno de sólidos y líquidos requerido según el caso, con al menos un día de anticipación.",
  },
  {
    question: "¿Puedo pedir mi cita por WhatsApp?",
    answer:
      "Sí, es la vía más rápida. También podés usar el formulario de \"Agendar cita\" del sitio: recepción confirma disponibilidad y te contacta.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "12+", label: "años de trayectoria" },
  { value: "3.500+", label: "mascotas atendidas" },
  { value: "2", label: "veterinarios de planta" },
  { value: "4.9/5", label: "satisfacción de propietarios" },
];

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
};

export const blogCategories = ["Prevención", "Vacunas", "Nutrición", "Cirugía", "Cachorros", "Urgencias"];

export const blogPosts: BlogPost[] = [
  {
    slug: "cuando-llevar-a-tu-mascota-al-veterinario",
    title: "Señales que indican que tu mascota necesita una consulta ya",
    category: "Urgencias",
    excerpt: "Decaimiento, vómito persistente, dificultad para respirar: una guía rápida para saber cuándo esperar y cuándo no.",
  },
  {
    slug: "calendario-de-vacunacion-cachorros",
    title: "El calendario de vacunación de un cachorro, mes a mes",
    category: "Vacunas",
    excerpt: "Qué vacuna toca en cada etapa y por qué saltarse una dosis puede dejar una ventana de riesgo.",
  },
  {
    slug: "como-elegir-el-alimento-correcto",
    title: "Cómo elegir el alimento correcto según la edad y tamaño de tu mascota",
    category: "Nutrición",
    excerpt: "No todos los alimentos \"premium\" son iguales. Qué mirar en la etiqueta antes de decidir.",
  },
  {
    slug: "preparar-a-tu-mascota-para-una-cirugia",
    title: "Cómo preparar a tu mascota (y a vos) para una cirugía programada",
    category: "Cirugía",
    excerpt: "Ayuno, traslado y qué esperar el día de la cirugía y en el post-operatorio.",
  },
  {
    slug: "chequeos-preventivos-mascotas-senior",
    title: "Por qué los chequeos preventivos importan más después de los 7 años",
    category: "Prevención",
    excerpt: "Los cambios en una mascota senior son graduales — el chequeo semestral detecta lo que el día a día no muestra.",
  },
  {
    slug: "primeros-dias-de-un-cachorro-en-casa",
    title: "Los primeros días de un cachorro en casa: checklist veterinario",
    category: "Cachorros",
    excerpt: "Primera visita, desparasitación, socialización y los errores más comunes de los primeros dueños.",
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
