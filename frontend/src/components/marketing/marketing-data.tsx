import {
  Activity,
  Award,
  Clock,
  Droplet,
  Feather,
  Flame,
  HeartPulse,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Contenido demo de la vertical Clínica Estética & Medicina Antiaging Élite.
// Alineado con la visión de la clínica y el dataset sembrado en el backend (`DatabaseSeeder.php`).

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
    slug: "toxina-botulinica",
    icon: Syringe,
    title: "Toxina Botulínica (Botox®)",
    short: "Atenuación de arrugas dinámicas y prevención del envejecimiento facial.",
    description:
      "Tratamiento médico no invasivo diseñado para relajar sutilmente los músculos faciales responsables de las líneas de expresión en frente, entrecejo y patas de gallo, logrando un aspecto fresco y descansado sin perder la naturalidad de la gesticulación.",
    bullets: [
      "Aplicación por médicos especialistas en estética",
      "Resultados visibles en 3 a 7 días y duración de 4 a 6 meses",
      "Prevención activa de arrugas profundas y surcos",
      "Protocolo personalizado con productos certificados",
    ],
    featured: true,
  },
  {
    slug: "acido-hialuronico",
    icon: Sparkles,
    title: "Ácido Hialurónico & Rellenos Faciales",
    short: "Restauración de volumen, perfilado labial y definición del contorno facial.",
    description:
      "Rellenos de gel de ácido hialurónico reticulado de altísima pureza para armonizar pómulos, mentón, surcos nasogenianos y labios. Aporta hidratación profunda e impulsa la estructura natural del rostro con un perfilamiento anatómico sofisticado.",
    bullets: [
      "Perfilado e hidratación avanzada de labios",
      "Marcaje mandibular y proyección de mentón / pómulos",
      "Biocompatible y reversible con hialuronidasa médica",
      "Efecto inmediato con mínima inflamación post-procedimiento",
    ],
    featured: true,
  },
  {
    slug: "limpieza-facial-profunda",
    icon: Droplet,
    title: "Higiene Facial Profunda & Hydrafacial",
    short: "Desintoxicación cutánea, exfoliación médica e hidratación con aparatología.",
    description:
      "Tratamiento integral de limpieza cutánea que combina peeling ultrasónico, extracción de impurezas y microdermoabrasión con puntas de diamante. Finaliza con infusiones de sueros antioxidantes y mascarilla LED fototerapéutica.",
    bullets: [
      "Eliminación de puntos negros y células muertas",
      "Oxigenación y nutrición celular profunda",
      "Apto para todo tipo de pieles (acnéica, sensible, mixta)",
      "Luminosidad y tersura visible desde la primera sesión",
    ],
    featured: true,
  },
  {
    slug: "bioestimuladores-colageno",
    icon: Activity,
    title: "Bioestimuladores de Colágeno",
    short: "Inducción natural de colágeno para firmeza y densidad dérmica duradera.",
    description:
      "Aplicación de hidroxiapatita cálcica o ácido poli-L-láctico (Radiesse / Sculptra) que estimula progresivamente la producción de colágeno propio. Combate la flacidez facial, de cuello y escote ofreciendo un efecto tensor progresivo y natural.",
    bullets: [
      "Combate la flacidez y la pérdida de elasticidad",
      "Efecto tensor sostenido hasta por 18 a 24 meses",
      "Mejora visible en la calidad y textura de la piel",
      "Aplicación rápida con microcánula médica",
    ],
    featured: true,
  },
  {
    slug: "contorno-corporal",
    icon: Zap,
    title: "Moldeo & Contorno Corporal",
    short: "Reducción de grasa localizada, enzimas médicas y firmeza corporal.",
    description:
      "Tratamientos médicos corporales no quirúrgicos que combinan enzimas recombinantes (lipasa, hialuronidasa, liasa), radiofrecuencia y cavitación para moldear abdomen, flancos y muslos, combatiendo la celulitis y la flacidez.",
    bullets: [
      "Enzimas biológicas para grasa localizada y celulitis",
      "Radiofrecuencia para tonificación dérmica corporal",
      "Protocolo reductivo no invasivo sin incapacidad",
      "Acompañamiento nutricional y medición antropométrica",
    ],
    featured: true,
  },
  {
    slug: "peeling-medico",
    icon: Feather,
    title: "Peeling Químico Médico",
    short: "Renovación celular para manchas, cicatrices de acné y textura irregular.",
    description:
      "Aplicación de ácidos médicos de concentración controlada (glicólico, mandélico, salicílico, TCA) que exfolian capas dañadas de la epidermis para atenuar hiperpigmentaciones, cicatrices superficiales y líneas finas.",
    bullets: [
      "Tratamiento eficaz de melasma y manchas solares",
      "Atenuación de marcas de acné y poros dilatados",
      "Estimulación de la renovación celular uniforme",
      "Protocolos según fototipo de piel y época del año",
    ],
  },
  {
    slug: "sueroterapia-antiaging",
    icon: HeartPulse,
    title: "Sueroterapia antiaging & detox",
    short: "Infusiones intravenosas de vitaminas, oligoelementos y antioxidantes de alto impacto.",
    description:
      "Protocolos intravenosos diseñados para revitalizar el organismo desde el interior. Combinan vitamina C megadosis, glutatión, zinc, magnesio y complejo B para reforzar el sistema inmune, desintoxicar el hígado y potenciar el brillo de la piel.",
    bullets: [
      "Absorción del 100% de nutrientes a nivel celular",
      "Acción antioxidante potente contra el estrés oxidativo",
      "Aumento inmediato de vitalidad y claridad mental",
      "Formulación adaptada tras valoración de salud",
    ],
    featured: true,
  },
  {
    slug: "valoracion-medica-estetica",
    icon: Stethoscope,
    title: "Valoración Facial & Corporal Computarizada",
    short: "Diagnóstico médico minucioso y diseño de plan de tratamiento personalizado.",
    description:
      "Consulta inicial integral donde el médico especialista analiza la estructura ósea, muscular y dérmica mediante escáner de piel y fotografía clínica. Diseñamos una hoja de ruta equilibrada, honesta y enfocada en tus objetivos.",
    bullets: [
      "Diagnóstico computarizado de arrugas, manchas y poros",
      "Plan médico personalizado con presupuesto transparente",
      "Revisión de historial de salud y contraindicaciones",
      "Seguimiento fotográfico de evolución en cada cita",
    ],
  },
  {
    slug: "depilacion-laser-medica",
    icon: Flame,
    title: "Depilación Láser Diodo Médica",
    short: "Eliminación permanente del vello con tecnología de enfriamiento constante.",
    description:
      "Láser de diodo médico con sistema de refrigeración por contacto que destruye el folículo piloso de manera rápida, indolora y segura en cualquier fototipo de piel, reduciendo el vello no deseado de forma definitiva.",
    bullets: [
      "Tecnología de última generación con cabezal ultra-frío",
      "Sesiones rápidas y confortables en zonas faciales y corporales",
      "Apto para fototipos oscuros y pieles bronceadas",
      "Resultados notarás desde la primera aplicación",
    ],
  },
  {
    slug: "rejuvenecimiento-laser",
    icon: Smile,
    title: "Rejuvenecimiento Láser & Radiofrecuencia",
    short: "Láser CO2 fraccionado y radiofrecuencia fraccionada con microagujas.",
    description:
      "Procedimientos de alta precisión para tensar el tejido dérmico, alisar arrugas profundas y tratar la flacidez periocular y peribucal. Inducen una rápida regeneración celular con tiempos de recuperación optimizados.",
    bullets: [
      "Tratamiento de arrugas peribucales y párpados",
      "Estimulación profunda de fibras de elastina y colágeno",
      "Disminución drástica de cicatrices y secuelas de acné",
      "Resultados de impacto y rejuvenecimiento global",
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
    slug: "sofia-valenzuela",
    name: "Dra. Sofía Valenzuela",
    role: "Médica Directora & Especialista Estética",
    specialty: "Armonización facial, inyectables y medicina antiaging",
    bio: "Más de 12 años transformando rostros con técnicas inyectables de alta precisión y enfoque natural.",
    longBio:
      "La Dra. Sofía Valenzuela lidera el equipo médico de Clínica Estética & Antiaging Élite. Formada en medicina estética avanzada y envejecimiento saludable en Europa y Latinoamérica, defiende que el verdadero arte estético reside en resaltar los rasgos propios de cada paciente sin alterar su identidad ni expresión.",
  },
  {
    slug: "alejandro-restrepo",
    name: "Dr. Alejandro Restrepo",
    role: "Médico Dermatólogo",
    specialty: "Dermatología láser, bioestimulación y renovación cutánea",
    bio: "Experto en aparatología médica láser, manchas, cicatrices y regeneración celular profunda.",
    longBio:
      "El Dr. Alejandro Restrepo se especializa en dermatología estética y aparatología de alta tecnología. Su enfoque riguroso y científico garantiza tratamientos seguros para hiperqueratosis, melasma, cicatrices y flacidez avanzada.",
  },
  {
    slug: "valentina-morales",
    name: "Valentina Morales",
    role: "Coordinadora de Experiencia al Paciente",
    specialty: "Agenda médica, atención personalizada y seguimiento post-procedimiento",
    bio: "Tu primer punto de contacto: coordina agendas, resuelve inquietudes y vela por tu bienestar.",
    longBio:
      "Valentina coordina la recepción y la logística médica de la clínica. Encargada del canal prioritario por WhatsApp, asegura que cada paciente reciba atención cálida, información clara sobre cuidados post-tratamiento y recordatorios oportunos para sus sesiones.",
  },
];

export function teamBySlug(slug: string): TeamMember | undefined {
  return team.find((t) => t.slug === slug);
}

export type Testimonial = {
  name: string;
  treatment: string;
  text: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Carolina Méndez",
    treatment: "Paciente de Botox & Armonización",
    text: "Tenía mucho temor de quedar inexpresiva con el Botox. La Dra. Sofía me explicó todo el protocolo y el resultado fue súper natural: luzco descansada y mi piel está divina.",
    rating: 5,
  },
  {
    name: "Mariana Giraldo",
    treatment: "Paciente de Ácido Hialurónico en Labios",
    text: "El perfilado de labios que me realizó la doctora quedó perfecto. Respetó la forma de mi boca y me dio el volumen sutil que buscaba sin exageraciones.",
    rating: 5,
  },
  {
    name: "Valeria Jaramillo",
    treatment: "Paciente de Sueroterapia & Hydrafacial",
    text: "Los sueros de vitamina C más la limpieza facial antes de mi boda me dejaron la piel luminosa como nunca. La atención del equipo es 10/10.",
    rating: 5,
  },
  {
    name: "Fernando Aristizábal",
    treatment: "Paciente de Bioestimulador Radiesse",
    text: "A mis 48 años notaba mucha flacidez en el contorno mandibular. Con la bioestimulación de colágeno recuperé la firmeza sin necesidad de cirugía.",
    rating: 5,
  },
  {
    name: "Isabel Cristina Gómez",
    treatment: "Paciente de Peeling para Manchas",
    text: "Logré atenuar manchas solares que llevaba años intentando borrar. La asesoría del Dr. Restrepo fue impecable y muy profesional.",
    rating: 5,
  },
  {
    name: "Daniela Osorio",
    treatment: "Paciente de Depilación Láser Médica",
    text: "El sistema de enfriamiento del láser hace que la sesión sea súper tolerante y cómoda. Los resultados son evidentes desde las primeras aplicaciones.",
    rating: 5,
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Los procedimientos estéticos duelen o requieren anestesia?",
    answer:
      "La mayoría de nuestros tratamientos son indoloros o mínimamente molestos. Para aplicaciones inyectables (Botox, ácido hialurónico) utilizamos crema anestésica tópica de alta eficacia y microagujas/cánulas ultra-finas.",
  },
  {
    question: "¿Cuánto dura el efecto de la toxina botulínica (Botox)?",
    answer:
      "El efecto habitualmente dura entre 4 y 6 meses, dependiendo del metabolismo de cada paciente y de las zonas tratadas. Se recomienda un retoque o mantenimiento semestral.",
  },
  {
    question: "¿Cuál es la diferencia entre el Botox y el Ácido Hialurónico?",
    answer:
      "El Botox relaja los músculos causantes de las arrugas de expresión (frente, entrecejo, patas de gallo). El ácido hialurónico aporta volumen, hidrata y rellena surcos o estructuras caídas (labios, pómulos, mentón).",
  },
  {
    question: "¿Puedo realizarme tratamientos antes de un evento importante?",
    answer:
      "Tratamientos como Hydrafacial o sueroterapia pueden realizarse 24-48 horas antes. Inyectables o peelings médicos requieren al menos 2 semanas de anticipación para garantizar la perfecta estabilización del producto y cero inflamación.",
  },
  {
    question: "¿Requiere incapacidad o reposo tras una sesión de inyectables?",
    answer:
      "No. La mayoría de los tratamientos son ambulatorios y te permiten reincorporarte de inmediato a tu jornada laboral y cotidiana, siguiendo breves recomendaciones (evitar ejercicio intenso y sauna por 24h).",
  },
  {
    question: "¿Qué métodos de pago tienen disponibles?",
    answer: "Aceptamos efectivo, tarjetas de débito/crédito, transferencias bancarias y planes de financiamiento o paquetes de sesiones con tarifas especiales.",
  },
  {
    question: "¿Los productos utilizados tienen registro sanitario y certificación médica?",
    answer:
      "Absolutamente. En Clínica Estética Élite trabajamos de forma exclusiva con laboratorios líderes a nivel mundial aprobados por INVIMA y FDA.",
  },
  {
    question: "¿Cómo agendo mi cita de valoración médica inicial?",
    answer:
      "Puedes agendar directamente desde esta web en el botón 'Agendar Cita', o escribirnos por WhatsApp. Nuestro equipo coordinará el día y hora que mejor se adapte a tu agenda.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "12+", label: "años de trayectoria médica" },
  { value: "5.200+", label: "pacientes satisfechos" },
  { value: "3", label: "médicos especialistas de planta" },
  { value: "4.9/5", label: "valoración promedio de satisfacción" },
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

export const blogCategories = ["Inyectables", "Cuidado Facial", "Antiaging", "Aparatología", "Corporal", "Casos de Éxito"];

export const blogPosts: BlogPost[] = [
  {
    slug: "mitos-y-verdades-sobre-el-botox",
    title: "Mitos y realidades sobre la Toxina Botulínica: ¿Quedaré inexpresiva?",
    category: "Inyectables",
    excerpt: "Desmintiendo las falsas ideas sobre el Botox. Cómo lograr un rostro joven, fresco y expresivo con dosis precisas.",
    image: "/gallery/aesthetic/rejuvenecimiento_facial.jpg",
    authorSlug: "sofia-valenzuela",
    date: "2026-08-15",
    readMinutes: 4,
    body: [
      "Existe la creencia popular de que aplicarse Botox congelará tu rostro o destruirá tus gestos naturales. La realidad médica es muy distinta: en manos de un profesional calificado, la toxina botulínica relaja de forma sutil y controlada solo los músculos hiperactivos.",
      "El objetivo de la medicina estética moderna no es borrar cada línea de expresión hasta dejar una máscara inerte, sino prevenir la fractura dérmica profunda y aportar un aspecto descansado, como después de unas excelentes vacaciones.",
      "La aplicación dura apenas 15 minutos y no requiere tiempo de recuperación. Los primeros cambios se aprecian a los 3 días, alcanzando su pico de armonía entre el día 10 y 14 post-aplicación.",
      "Comenzar de forma preventiva alrededor de los 28 a 35 años evita que las arrugas finas de expresión se conviertan en marcas permanentes e imborrables sobre la piel.",
    ],
  },
  {
    slug: "bioestimuladores-el-secreto-del-colageno",
    title: "Bioestimuladores de colágeno: El tratamiento definitivo contra la flacidez",
    category: "Antiaging",
    excerpt: "Descubre cómo Radiesse y Sculptra obligan a tu propia piel a producir colágeno joven y firme.",
    image: "/gallery/aesthetic/armonizacion_perfilado.jpg",
    authorSlug: "alejandro-restrepo",
    date: "2026-07-20",
    readMinutes: 5,
    body: [
      "A partir de los 25 años, el cuerpo pierde aproximadamente 1% de colágeno al año. Esta pérdida se traduce en piel más delgada, menor elasticidad y aparición de flacidez en mejillas, cuello y contorno facial.",
      "A diferencia de los rellenos de volumen tradicional, los bioestimuladores de colágeno no hinchan la cara. Su función es activar los fibroblastos en la dermis profunda para que generen una nueva malla de colágeno propio.",
      "Los resultados no son inmediatos sino progresivos: durante los meses 1 al 3 la piel recupera densidad, firmeza y estructura, con una durabilidad superior a los 18 meses.",
      "Es el tratamiento de elección para quienes buscan combatir la descolgación del tercio inferior del rostro sin alterar sus volumenes anatómicos.",
    ],
  },
  {
    slug: "guia-para-cuidar-tu-piel-despues-de-un-peeling",
    title: "Guía médica para cuidar tu piel después de un peeling o láser",
    category: "Cuidado Facial",
    excerpt: "Fotoprotección estricta, hidratación biocompatible y hábitos clave para maximizar los resultados.",
    image: "/gallery/aesthetic/limpieza_dermocosmiatria.jpg",
    authorSlug: "alejandro-restrepo",
    date: "2026-07-02",
    readMinutes: 4,
    body: [
      "Tras someterse a un peeling médico o sesión de rejuvenecimiento láser, la barrera cutánea se encuentra en proceso de renovación acelerada. El éxito del tratamiento depende en un 50% de los cuidados en casa.",
      "La regla de oro innegable es el uso continuo de protector solar de amplio espectro (FPS 50+) reaplicado cada 3 horas, incluso si estás en espacios cerrados con luz de pantallas o bombillas.",
      "Evita rascar, halar o desprender las pequeñas descamaciones que puedan surgir. Permite que la piel renovada caiga de forma natural para evitar manchas por hiperpigmentación post-inflamatoria.",
      "Mantén una rutina minimalista de limpieza suave y crema regeneradora con ceramidas o ácido hialurónico recomendada por tu dermatólogo tratante.",
    ],
  },
  {
    slug: "beneficios-de-la-sueroterapia-intravenosa",
    title: "Por qué la sueroterapia intravenosa es el aliado perfecto en la estética",
    category: "Antiaging",
    excerpt: "Vitaminas en megadosis y antioxidantes directos al torrente sanguíneo para potenciar el brillo cutáneo.",
    image: "/gallery/aesthetic/cabina_clinica.jpg",
    authorSlug: "sofia-valenzuela",
    date: "2026-06-18",
    readMinutes: 4,
    body: [
      "La belleza exterior es el reflejo directo de la salud celular interna. Los suplementos orales a menudo pierden gran parte de su efectividad al pasar por el sistema digestivo.",
      "La sueroterapia logra una biodisponibilidad del 100%, entregando megadosis de Vitamina C, Glutatión y oligoelementos directo a las células para neutralizar radicales libres y reducir la inflamación sistémica.",
      "Los pacientes reportan una mayor energía diaria, mejor calidad de sueño, fortalecimiento capilar y un brillo 'glow' inconfundible en la piel tras una serie de 3 a 5 sesiones.",
      "Es el complemento idóneo para potenciar los resultados de cualquier tratamiento facial o corporal inyectable.",
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
