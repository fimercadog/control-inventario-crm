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
  Users,
  Clock,
  CalendarDays,
  FileText,
  CalendarClock,
  LayoutDashboard,
  Briefcase,
  Bot,
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
  image: string;
  authorSlug: string;
  date: string;
  readMinutes: number;
  body: string[];
};

export const blogCategories = ["Prevención", "Vacunas", "Nutrición", "Cirugía", "Cachorros", "Urgencias"];

export const blogPosts: BlogPost[] = [
  {
    slug: "cuando-llevar-a-tu-mascota-al-veterinario",
    title: "Señales que indican que tu mascota necesita una consulta ya",
    category: "Urgencias",
    excerpt: "Decaimiento, vómito persistente, dificultad para respirar: una guía rápida para saber cuándo esperar y cuándo no.",
    image: "/gallery/pet-7.jpg",
    authorSlug: "carlos-medina",
    date: "2026-08-12",
    readMinutes: 4,
    body: [
      "No toda molestia es una urgencia, pero algunas señales sí ameritan atención inmediata y no un \"vamos viendo cómo sigue\". La regla general que usamos en consulta: si el síntoma es súbito, si compromete la respiración, o si tu mascota deja de responder como siempre, es momento de venir.",
      "Decaimiento marcado — que no se levante a comer, que no reaccione a estímulos que normalmente la entusiasman — es de las señales más subestimadas. Un perro o gato que \"está raro\" desde hace más de unas horas ya justifica una consulta, no una espera de \"a ver si mejora solo\".",
      "El vómito persistente (más de dos o tres episodios en pocas horas, o con sangre) y la dificultad para respirar son motivo de consulta prioritaria siempre. En el segundo caso, cada minuto cuenta: llamanos antes de salir para que el equipo esté listo cuando llegues.",
      "Otras señales que no deberían esperar: distensión abdominal repentina, convulsiones, imposibilidad de orinar, sangrado que no cede, o un golpe/caída con cojera inmediata. Ante la duda, la llamada no cuesta nada — preferimos revisar de más que de menos.",
    ],
  },
  {
    slug: "calendario-de-vacunacion-cachorros",
    title: "El calendario de vacunación de un cachorro, mes a mes",
    category: "Vacunas",
    excerpt: "Qué vacuna toca en cada etapa y por qué saltarse una dosis puede dejar una ventana de riesgo.",
    image: "/gallery/pet-4.jpg",
    authorSlug: "laura-pena",
    date: "2026-07-28",
    readMinutes: 5,
    body: [
      "Un cachorro nace con cierta protección de la madre, pero esa inmunidad baja gradualmente entre las 6 y las 16 semanas de vida — justo la ventana en la que hay que vacunar, y por eso el esquema se aplica en varias dosis, no en una sola.",
      "El esquema típico arranca alrededor de las 6-8 semanas con la primera dosis de la polivalente (moquillo, parvovirus, hepatitis, entre otras según el laboratorio), se refuerza cada 3-4 semanas hasta las 16 semanas, y la antirrábica se suma desde los 3 meses.",
      "Saltarse una dosis del esquema inicial no es \"recuperable\" con solo aplicar la siguiente: cada refuerzo depende de que el anterior haya generado la respuesta esperada. Por eso llevamos el registro exacto de lote y fecha, y te avisamos con anticipación cuándo toca la próxima.",
      "Después del primer año, la mayoría de las vacunas pasan a un esquema de refuerzo anual. Traé siempre el carné de vacunación a cada visita, aunque sea de rutina — es el historial que evita que se repita o se salte una dosis.",
    ],
  },
  {
    slug: "como-elegir-el-alimento-correcto",
    title: "Cómo elegir el alimento correcto según la edad y tamaño de tu mascota",
    category: "Nutrición",
    excerpt: "No todos los alimentos \"premium\" son iguales. Qué mirar en la etiqueta antes de decidir.",
    image: "/gallery/pet-4.jpg",
    authorSlug: "carlos-medina",
    date: "2026-07-10",
    readMinutes: 4,
    body: [
      "La palabra \"premium\" en el empaque no está regulada — no garantiza nada por sí sola. Lo que sí importa es la lista de ingredientes (una fuente de proteína animal identificada, no genérica como \"subproductos\") y que el alimento esté formulado para la etapa de vida correcta.",
      "Un cachorro necesita más proteína y calorías por su crecimiento; un adulto sedentario necesita menos de lo que dice la tabla genérica de la bolsa; un senior suele beneficiarse de fórmulas más livianas para las articulaciones y el riñón. Alimentar con la fórmula de otra etapa no es un ahorro, es un desajuste silencioso.",
      "El tamaño también importa: las razas grandes necesitan un control más estricto de calcio y fósforo en el crecimiento para evitar problemas articulares a futuro, y las razas pequeñas gastan más energía por kilo de lo que parece.",
      "Si tu mascota tiene una condición clínica (renal, digestiva, sobrepeso), el alimento pasa a ser parte del tratamiento, no una elección de supermercado — ahí sí conviene una dieta terapéutica indicada en consulta, no una decisión por cuenta propia.",
    ],
  },
  {
    slug: "preparar-a-tu-mascota-para-una-cirugia",
    title: "Cómo preparar a tu mascota (y a vos) para una cirugía programada",
    category: "Cirugía",
    excerpt: "Ayuno, traslado y qué esperar el día de la cirugía y en el post-operatorio.",
    image: "/gallery/pet-13.jpg",
    authorSlug: "carlos-medina",
    date: "2026-06-22",
    readMinutes: 5,
    body: [
      "Toda cirugía con anestesia requiere ayuno previo — típicamente de sólidos desde la noche anterior y de agua unas horas antes, aunque el esquema exacto varía según el paciente y te lo confirmamos al agendar. Un estómago lleno durante la anestesia es un riesgo real de aspiración, así que esta indicación no es opcional.",
      "El día de la cirugía, traé a tu mascota temprano y con tiempo: hacemos una revisión pre-anestésica antes de proceder. Es normal sentir ansiedad — la mayoría de los propietarios la sienten más que sus mascotas — y preferimos que preguntes todo lo que necesites antes, no durante la espera.",
      "Durante el procedimiento trabajamos con monitoreo anestésico continuo (frecuencia cardíaca, oxigenación, temperatura) y te llamamos apenas termina para contarte cómo salió y coordinar el retiro.",
      "El post-operatorio es donde más se juega la recuperación: reposo estricto los primeros días, collar isabelino si aplica para que no se lastime el punto, y los controles que te indiquemos sin saltarte ninguno, aunque la herida se vea bien.",
    ],
  },
  {
    slug: "chequeos-preventivos-mascotas-senior",
    title: "Por qué los chequeos preventivos importan más después de los 7 años",
    category: "Prevención",
    excerpt: "Los cambios en una mascota senior son graduales — el chequeo semestral detecta lo que el día a día no muestra.",
    image: "/gallery/pet-3.jpg",
    authorSlug: "laura-pena",
    date: "2026-05-30",
    readMinutes: 4,
    body: [
      "A partir de los 7 años (antes en razas grandes), el metabolismo, las articulaciones, los riñones y el corazón empiezan a cambiar de forma gradual — tan gradual que en casa es difícil notarlo, porque lo ves todos los días.",
      "Por eso pasamos de un chequeo anual a uno semestral en pacientes senior: duplicar la frecuencia de control multiplica las chances de detectar algo a tiempo, cuando todavía es manejable con un ajuste de dieta o tratamiento, y no cuando ya se volvió una urgencia.",
      "Un chequeo senior típico incluye examen físico completo, control de peso y masa muscular, revisión dental, y un panel básico de laboratorio (función renal, hepática, hemograma) al menos una vez al año, más seguido si el caso lo amerita.",
      "No es alarmismo: es la misma lógica que un chequeo médico humano después de cierta edad. La mascota no te va a decir que algo le duele distinto — el chequeo periódico es la forma de enterarte antes de que sea evidente.",
    ],
  },
  {
    slug: "primeros-dias-de-un-cachorro-en-casa",
    title: "Los primeros días de un cachorro en casa: checklist veterinario",
    category: "Cachorros",
    excerpt: "Primera visita, desparasitación, socialización y los errores más comunes de los primeros dueños.",
    image: "/gallery/pet-1.jpg",
    authorSlug: "laura-pena",
    date: "2026-05-08",
    readMinutes: 5,
    body: [
      "La primera visita veterinaria debería pasar en la primera semana en casa, aunque el cachorro se vea perfectamente sano: revisamos peso, examen físico general, y armamos el esquema de vacunación y desparasitación desde cero con fechas concretas.",
      "La desparasitación interna en cachorros empieza más temprano y con más frecuencia de lo que la mayoría espera — cada 2-3 semanas hasta los 3 meses, después mensual hasta el año. No es opcional ni algo que se resuelve \"cuando se vea algo raro\".",
      "La socialización tiene una ventana crítica entre las 3 y las 14 semanas: es cuando el cachorro aprende qué es normal (otras personas, otros animales, ruidos, superficies) sin miedo. Perderse esa ventana no es irreversible, pero cuesta mucho más trabajo después.",
      "El error más común de los primeros dueños: esperar a que \"se vea algo mal\" para consultar. La medicina preventiva en un cachorro no es un gasto extra, es la base de toda la salud que va a tener de adulto — y sale más barata que resolver lo que se pudo prevenir.",
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



// --- HRMS Product Pages Data ---
export const navProduct = [
  ["Gestión de empleados", "/producto/empleados"],
  ["Asistencia", "/producto/asistencia"],
  ["Vacaciones y permisos", "/producto/vacaciones"],
  ["Documentos", "/producto/documentos"],
  ["Turnos", "/producto/turnos"],
  ["Reportes", "/producto/reportes"],
  ["IA para RRHH", "/producto/ia"],
];

export const navSolutions = [
  ["Para pequeñas empresas", "/soluciones#pymes"],
  ["Para equipos de RRHH", "/soluciones#rrhh"],
  ["Para empresas con turnos", "/soluciones#turnos"],
  ["Para reclutamiento", "/soluciones#reclutamiento"],
];

export const features = [
  { title: "Empleados", description: "Centraliza toda la información de tus colaboradores.", icon: Users, href: "/producto/empleados" },
  { title: "Asistencia", description: "Controla entradas, salidas, retrasos y ausencias.", icon: Clock, href: "/producto/asistencia" },
  { title: "Vacaciones y permisos", description: "Gestiona solicitudes, aprobaciones y saldos.", icon: CalendarDays, href: "/producto/vacaciones" },
  { title: "Documentos", description: "Organiza contratos, certificados y archivos laborales.", icon: FileText, href: "/producto/documentos" },
  { title: "Turnos", description: "Planifica horarios, jornadas y descansos.", icon: CalendarClock, href: "/producto/turnos" },
  { title: "Reportes", description: "Obtén métricas útiles para tomar decisiones.", icon: LayoutDashboard, href: "/producto/reportes" },
  { title: "Reclutamiento", description: "Gestiona candidatos y procesos de selección.", icon: Briefcase, href: "/reclutamiento" },
  { title: "IA para RRHH", description: "Automatiza consultas y procesos internos.", icon: Bot, href: "/producto/ia" },
];

export const productPages = {
  empleados: {
    title: "Expediente digital de cada empleado",
    eyebrow: "Gestión de empleados",
    description: "Toda la información personal, laboral, documental e histórica de tus colaboradores en una ficha clara y accionable.",
    icon: Users,
    bullets: ["Datos personales y laborales", "Cargo, área, contrato y jefe", "Documentos e historial por colaborador", "Tabs para asistencia, vacaciones y novedades"],
  },
  asistencia: {
    title: "Asistencia clara, diaria y reportable",
    eyebrow: "Control de asistencia",
    description: "Visualiza presentes, ausentes, llegadas tarde e incapacidades con filtros por fecha, área y empleado.",
    icon: Clock,
    bullets: ["Entradas y salidas", "Retrasos y ausencias", "Historial por colaborador", "Reportes exportables"],
  },
  vacaciones: {
    title: "Vacaciones y permisos sin cadenas de correos",
    eyebrow: "Solicitudes y aprobaciones",
    description: "Convierte solicitudes dispersas en flujos aprobables, trazables y visibles para RRHH.",
    icon: CalendarDays,
    bullets: ["Empleado solicita", "Jefe aprueba o rechaza", "RRHH queda informado", "Saldo y calendario actualizados"],
  },
  documentos: {
    title: "Documentos laborales siempre ubicables",
    eyebrow: "Gestión documental",
    description: "Contratos, certificados, anexos y soportes con alertas de vencimiento y expediente asociado.",
    icon: FileText,
    bullets: ["Contratos y anexos", "Certificados laborales", "Soportes personales", "Alertas por vencimiento"],
  },
  turnos: {
    title: "Planificación semanal de turnos",
    eyebrow: "Turnos y jornadas",
    description: "Asigna horarios, controla descansos y detecta conflictos antes de que lleguen a la operación.",
    icon: CalendarClock,
    bullets: ["Vista semanal", "Asignación por empleado", "Horarios y descansos", "Conflictos básicos"],
  },
  reportes: {
    title: "Reportes para decidir, no solo almacenar",
    eyebrow: "Analítica de RRHH",
    description: "Indicadores de asistencia, ausentismo, vacaciones, documentos, altas, bajas y distribución por área.",
    icon: LayoutDashboard,
    bullets: ["Ausentismo y tardanzas", "Distribución por área", "Documentos vencidos", "Exportaciones CSV/PDF"],
  },
  ia: {
    title: "Tu asistente de Recursos Humanos disponible 24/7",
    eyebrow: "IA para RRHH",
    description: "Prepara una capa conversacional para responder políticas, vacaciones, turnos, certificados y solicitudes.",
    icon: Bot,
    bullets: ["Consultas de vacaciones", "Certificados laborales", "Políticas internas", "Solicitudes guiadas"],
  },
};
