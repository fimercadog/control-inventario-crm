import {
  BarChart3,
  ClipboardList,
  Code,
  Contact,
  KeyRound,
  Package,
  Plug,
  ShoppingCart,
  Terminal,
  Warehouse,
  Webhook,
} from "lucide-react";

export const productPages = {
  crm: {
    eyebrow: "CRM de ventas",
    title: "Leads y clientes en un pipeline que se sigue solo",
    description:
      "Captura leads desde el formulario publico, conviertelos en clientes y mueve cada deal por etapas con actividades de seguimiento visibles para todo el equipo.",
    bullets: [
      "Formulario publico de leads",
      "Clientes con historial de contacto",
      "Pipeline de deals por etapa",
      "Actividades y recordatorios de seguimiento",
    ],
    screenshot: "/product/pipeline.png",
  },
  inventario: {
    eyebrow: "Control de inventario",
    title: "Sabes cuanto stock tienes y donde esta",
    description:
      "Un catalogo de productos, varias bodegas y una bitacora que registra cada entrada, salida y ajuste para que el inventario del sistema coincida con el fisico.",
    bullets: [
      "Catalogo de productos con SKU y costo",
      "Stock por bodega",
      "Bitacora de movimientos",
      "Alertas de stock bajo",
    ],
    screenshot: "/product/stock.png",
  },
  pedidos: {
    eyebrow: "Pedidos de venta",
    title: "El pedido de venta que descuenta stock al confirmarse",
    description:
      "El puente entre CRM e inventario: eliges cliente, agregas lineas de producto y al confirmar el pedido el sistema descuenta el stock de la bodega elegida.",
    bullets: [
      "Cliente tomado del CRM",
      "Lineas de producto con precio",
      "Confirmar genera salida de stock",
      "Detalle del pedido siempre trazable",
    ],
    screenshot: "/product/movimientos.png",
  },
  compras: {
    eyebrow: "Compras y proveedores",
    title: "Compras que reponen el inventario sin cuadrar a mano",
    description:
      "Registra proveedores, crea ordenes de compra y al marcarlas como recibidas el stock de la bodega entra automaticamente con su movimiento asociado.",
    bullets: [
      "Directorio de proveedores",
      "Ordenes de compra con lineas",
      "Recibir genera entrada de stock",
      "Costo y trazabilidad por orden",
    ],
    screenshot: "/product/productos.png",
  },
  reportes: {
    eyebrow: "Analitica de operacion",
    title: "Reportes para decidir, no solo para archivar",
    description:
      "Indicadores de ventas, pipeline, rotacion de inventario, stock bajo, compras y movimientos, con exportaciones CSV y PDF por modulo.",
    bullets: [
      "Ventas y pipeline de deals",
      "Rotacion y stock bajo",
      "Compras por proveedor",
      "Exportaciones CSV / PDF",
    ],
    screenshot: "/product/reportes.png",
  },
  ia: {
    eyebrow: "Asistente de IA",
    title: "Tu asistente de operacion comercial y de inventario",
    description:
      "Prepara una capa conversacional para consultar stock disponible, datos de clientes, estado de pedidos y ordenes de compra sin entrar a cada modulo.",
    bullets: [
      "Consultas de stock por bodega",
      "Ficha rapida de cliente",
      "Estado de pedidos y compras",
      "Interfaz lista, sin proveedor conectado todavia",
    ],
    screenshot: "/product/ia.png",
  },
} as const;

export const blogPosts = [
  {
    slug: "conectar-crm-e-inventario",
    title: "Por que el CRM y el inventario deben hablar entre si",
    category: "Operacion",
    excerpt: "Contenido inicial ficticio sobre como el pedido de venta une ventas y bodega en un solo flujo.",
  },
  {
    slug: "stock-que-no-cuadra",
    title: "Stock que no cuadra: como cerrar la brecha entre el sistema y la bodega",
    category: "Inventario",
    excerpt: "Contenido inicial ficticio sobre bitacora de movimientos, ajustes y conteos ciclicos.",
  },
  {
    slug: "pipeline-de-ventas-para-pymes",
    title: "Un pipeline de ventas simple para PYMES",
    category: "CRM",
    excerpt: "Contenido inicial ficticio para convertir leads dispersos en deals con etapas y seguimiento.",
  },
  {
    slug: "ordenes-de-compra-sin-excel",
    title: "Ordenes de compra sin Excel: reponer stock con trazabilidad",
    category: "Compras",
    excerpt: "Contenido inicial ficticio sobre proveedores, ordenes y entradas automaticas de inventario.",
  },
  {
    slug: "reportes-de-rotacion",
    title: "Rotacion de inventario: las metricas que si sirven",
    category: "Reportes",
    excerpt: "Contenido inicial ficticio sobre indicadores accionables de stock y ventas.",
  },
  {
    slug: "ia-en-la-operacion-diaria",
    title: "IA en la operacion diaria: casos utiles antes del hype",
    category: "IA",
    excerpt: "Contenido inicial ficticio sobre asistentes internos para consultar stock, clientes y pedidos.",
  },
];

// Guias para quien USA la plataforma. Lenguaje de "como hago esto", sin jerga.
export const userDocSections = [
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    icon: Package,
    items: [
      "Crear tu empresa",
      "Crear usuarios",
      "Configurar permisos",
      "Cargar productos",
      "Crear bodegas",
    ],
  },
  {
    id: "crm",
    title: "CRM",
    icon: Contact,
    items: [
      "Registrar clientes potenciales",
      "Convertir un contacto en cliente",
      "Gestionar oportunidades",
      "Registrar seguimientos",
    ],
  },
  {
    id: "inventario",
    title: "Inventario",
    icon: Warehouse,
    items: [
      "Crear productos",
      "Consultar existencias",
      "Mover productos entre bodegas",
      "Registrar ajustes de inventario",
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos",
    icon: ClipboardList,
    items: [
      "Crear un pedido",
      "Agregar productos",
      "Confirmar una venta",
      "Anular un pedido",
    ],
  },
  {
    id: "compras",
    title: "Compras",
    icon: ShoppingCart,
    items: [
      "Registrar proveedores",
      "Crear ordenes de compra",
      "Recibir mercancia",
      "Consultar costos",
    ],
  },
  {
    id: "reportes",
    title: "Reportes",
    icon: BarChart3,
    items: [
      "Ventas",
      "Inventario",
      "Stock bajo",
      "Exportar informacion",
      "Indicadores del negocio",
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
      "CRUD estandar por recurso (leads, clientes, productos, pedidos, compras)",
      "Catalogo publico sin auth: /api/public/catalog/*",
      "Solicitud de cotizacion: POST /api/public/catalog/quote-requests",
      "Subida de imagen de producto: POST /api/products/{id}/image",
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks e integraciones",
    icon: Webhook,
    items: [
      "Webhooks salientes (pedido confirmado, stock bajo) — en el roadmap",
      "Sincronizacion con contabilidad o e-commerce",
      "Exportaciones programadas",
      "Integraciones a medida bajo pedido",
    ],
  },
  {
    id: "ejemplos",
    title: "Ejemplos",
    icon: Terminal,
    items: [
      "curl: autenticarse y listar productos",
      "Crear un pedido y confirmarlo end to end",
      "Coleccion de Postman / Insomnia",
      "Snippets en JavaScript y PHP",
    ],
  },
];
