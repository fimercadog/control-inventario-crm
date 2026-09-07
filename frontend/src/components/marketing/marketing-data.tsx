import { BarChart3, ClipboardList, Contact, Package, ShoppingCart, Warehouse } from "lucide-react";

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

export const docSections = [
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    icon: Package,
    items: [
      "Crear la empresa y los primeros usuarios",
      "Roles y permisos (Spatie laravel-permission)",
      "Cargar el catalogo de productos",
      "Crear bodegas y saldos iniciales",
    ],
  },
  {
    id: "crm",
    title: "CRM",
    icon: Contact,
    items: [
      "Leads desde el formulario publico",
      "Convertir un lead en cliente",
      "Mover deals por el pipeline",
      "Registrar actividades de seguimiento",
    ],
  },
  {
    id: "inventario",
    title: "Inventario",
    icon: Warehouse,
    items: [
      "Productos, SKU y costo",
      "Stock por bodega",
      "Registrar un movimiento manual",
      "Leer la bitacora de movimientos",
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos de venta",
    icon: ClipboardList,
    items: [
      "Crear un pedido para un cliente",
      "Agregar lineas de producto",
      "Confirmar el pedido y descontar stock",
      "Anular un pedido confirmado",
    ],
  },
  {
    id: "compras",
    title: "Compras",
    icon: ShoppingCart,
    items: [
      "Registrar un proveedor",
      "Crear una orden de compra",
      "Recibir la orden y reponer stock",
      "Costo por orden",
    ],
  },
  {
    id: "reportes",
    title: "Reportes y API",
    icon: BarChart3,
    items: [
      "Reportes de ventas e inventario",
      "Exportar a CSV y PDF",
      "Autenticacion de la API (Sanctum)",
      "Endpoints principales",
    ],
  },
];
