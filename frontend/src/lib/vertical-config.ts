import { CLINIC_CONFIG } from "@/lib/aesthetic-config";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileCheck,
  FileSignature,
  FileText,
  FolderKanban,
  History,
  Images,
  Inbox,
  LayoutDashboard,
  LucideIcon,
  Package,
  Receipt,
  ScanFace,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
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
  category: "clinica" | "crm" | "inventario" | "finanzas" | "reportes" | "config";
};

/**
 * Sistema de Configuración de Vertical (Aesthetic Medicine).
 * Define qué módulos están habilitados, sus nombres, iconos y comportamientos
 * aislados de otras verticales sin romper el ERP Core.
 */
export const AESTHETIC_VERTICAL_CONFIG = {
  verticalId: "aesthetic",
  brandName: CLINIC_CONFIG.brand.name,
  brandShortName: CLINIC_CONFIG.brand.shortName,
  adminTitle: CLINIC_CONFIG.brand.name,
  adminSubtitle: "Panel de Gestión Clínica & Administrativa",
  defaultUserRole: "Médico Especialista",
  defaultUserName: "Dra. Valentina Mendoza",

  // Módulos Deshabilitados en Medicina Estética (Ocultados completamente en UI)
  disabledModules: [],

  // Mapeo de Nombres de Módulos para Medicina Estética
  moduleLabels: {
    dashboard: "Dashboard",
    citas: "Agenda de Citas",
    pacientes: "Pacientes Estéticos",
    consultas: "Valoraciones Estéticas",
    aplicaciones: "Aplicaciones & Dosis",
    "proximas-sesiones": "Próximas Sesiones",
    procedimientos: "Procedimientos Estéticos",
    diagnosticos: "Diagnósticos Estéticos",
    recetas: "Fórmulas & Prescripciones",
    servicios: "Tratamientos & Servicios",
    especies: "Zonas & Especialidades",
    productos: "Dermocosmética & Insumos",
    "alertas-stock": "Alertas de Insumos",
    "movimientos-inventario": "Movimientos de Stock",
    bodegas: "Bodegas & Almacenes",
    cajas: "Caja & Tesorería",
    "sesiones-caja": "Sesiones de Caja",
    facturas: "Facturación",
    "cuentas-por-cobrar": "Cuentas por Cobrar",
    "cuentas-por-pagar": "Cuentas por Pagar",
    "reportes-clinicos": "Reportes Estéticos",
    "reportes-comerciales": "Reportes Comerciales",
    auditoria: "Auditoría & Logs",
  },

  // Iconos Estéticos Asignados por Módulo
  moduleIcons: {
    dashboard: LayoutDashboard,
    citas: CalendarDays,
    pacientes: Users,
    consultas: ScanFace,
    procedimientos: Sparkles,
    diagnosticos: ClipboardCheck,
    recetas: FileText,
    servicios: Activity,
    productos: Package,
    "alertas-stock": AlertTriangle,
    "movimientos-inventario": Boxes,
    bodegas: Archive,
    cajas: Wallet,
    "sesiones-caja": Clock,
    facturas: Receipt,
    "cuentas-por-cobrar": DollarSign,
    "cuentas-por-pagar": DollarSign,
    "reportes-clinicos": BarChart3,
    "reportes-comerciales": BarChart3,
    auditoria: ShieldCheck,
    configuracion: Settings,
  } as Record<string, LucideIcon>,
};
