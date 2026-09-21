import { IPS_CONFIG } from "@/lib/ips-config";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  Clock,
  DollarSign,
  FileCheck,
  FileSignature,
  FileText,
  HeartPulse,
  History,
  Hospital,
  Inbox,
  LayoutDashboard,
  LucideIcon,
  Package,
  Pill,
  Receipt,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Tag,
  Tags,
  Truck,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

export type VerticalModule = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  category: "clinica" | "asistencial" | "comercial" | "operaciones" | "finanzas" | "administracion";
};

/**
 * Sistema de Configuración de Vertical IPS (Prestador de Servicios de Salud).
 * Define los módulos habilitados, etiquetas médicas normalizadas, iconos y estructuración del sistema
 * separando rigurosamente Historias Clínicas, Facturación Electrónica, RIPS y Cuentas Médicas.
 */
export const IPS_VERTICAL_CONFIG = {
  verticalId: "ips",
  brandName: IPS_CONFIG.brand.name,
  brandShortName: IPS_CONFIG.brand.shortName,
  adminTitle: IPS_CONFIG.brand.name,
  adminSubtitle: "Portal de Gestión Clínica, Asistencial y Administrativa",
  defaultUserRole: "Director Médico (Demo)",
  defaultUserName: "Dr. Alejandro Morales",

  // Módulos Deshabilitados en IPS (Ocultados completamente en UI)
  disabledModules: ["especies", "razas", "vacunas-mascotas"],

  // Mapeo de Nombres de Módulos para IPS (Separación estricta de HC, RIPS y Facturación)
  moduleLabels: {
    dashboard: "Panel IPS & KPIs",
    citas: "Agenda de Citas Médicas",
    pacientes: "Directorio de Pacientes",
    consultas: "Historias Clínicas",
    procedimientos: "Procedimientos",
    diagnosticos: "Diagnósticos CIE-10",
    recetas: "Órdenes & Prescripciones Médicas",
    servicios: "Portafolio de Servicios & Tarifario",
    productos: "Farmacia & Insumos Hospitalarios",
    "alertas-stock": "Alertas de Dispositivos & Medicamentos",
    "movimientos-inventario": "Kardex de Farmacia",
    bodegas: "Almacenes & Bodegas Farmacéuticas",
    cajas: "Caja & Copagos",
    "sesiones-caja": "Turnos de Caja",
    facturas: "Facturación Electrónica",
    rips: "Módulo RIPS",
    "cuentas-por-cobrar": "Cuentas Médicas por Cobrar",
    "cuentas-por-pagar": "Cuentas por Pagar (Proveedores)",
    "reportes-clinicos": "Reportes Epidemiológicos",
    "reportes-comerciales": "Reportes de Cuentas Médicas",
    auditoria: "Auditoría de Historias Clínicas",
    configuracion: "Configuración IPS & Habilitación",
  },

  // Iconos Médicos Asignados por Módulo
  moduleIcons: {
    dashboard: LayoutDashboard,
    citas: CalendarDays,
    pacientes: Users,
    consultas: Stethoscope,
    procedimientos: Activity,
    diagnosticos: ClipboardCheck,
    recetas: FileText,
    servicios: Hospital,
    productos: Pill,
    "alertas-stock": AlertTriangle,
    "movimientos-inventario": Boxes,
    bodegas: Archive,
    cajas: Wallet,
    "sesiones-caja": Clock,
    facturas: Receipt,
    rips: FileCheck,
    "cuentas-por-cobrar": DollarSign,
    "cuentas-por-pagar": DollarSign,
    "reportes-clinicos": BarChart3,
    "reportes-comerciales": BarChart3,
    auditoria: ShieldCheck,
    configuracion: Settings,
  } as Record<string, LucideIcon>,
};
