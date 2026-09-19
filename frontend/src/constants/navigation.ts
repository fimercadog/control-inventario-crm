import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CircleCheck,
  CircleDashed,
  CircleDollarSign,
  CircleUserRound,
  Contact,
  FileSignature,
  Globe,
  Handshake,
  KeyRound,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  MapPin,
  Newspaper,
  Plus,
  Settings,
  ShieldCheck,
  SquareCheckBig,
  SquarePen,
  Target,
  UserRound,
  UserRoundCheck,
  UserRoundPlus,
  Users,
  UsersRound,
  WifiOff,
} from "lucide-react";

export interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: { title: string; href: string; icon: LucideIcon; writeOnly?: boolean }[];
  adminOnly?: boolean;
}

export const DASHBOARD_LINK: NavLink = { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard };

// Promoted out of BOTTOM_LINKS: reports are a destination people visit
// often, not a utility like Settings — burying it at the very bottom of the
// sidebar next to Configuración made it hard to find.
export const REPORTS_LINK: NavLink = { title: "Reportes", href: "/reports", icon: Target };

// Emergency-equipment placement, not filed inside a submenu: an admin should
// see this — and its live status — without opening anything first.
export const CONTINGENCY_LINK: NavLink = {
  title: "Modo contingencia",
  href: "/settings/contingency",
  // WifiOff over a generic shield icon — contingency mode IS "working
  // without a connection," so the icon should say that directly.
  icon: WifiOff,
  adminOnly: true,
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Propiedades",
    icon: Building2,
    items: [
      { title: "Todas", href: "/properties", icon: LayoutList },
      { title: "Disponibles", href: "/properties?status=disponible", icon: CircleCheck },
      { title: "Reservadas", href: "/properties?status=reservado", icon: CircleDashed },
      { title: "Vendidas", href: "/properties?status=vendido", icon: CircleDollarSign },
      { title: "Arrendadas", href: "/properties?status=arrendado", icon: KeyRound },
      { title: "Nueva propiedad", href: "/properties/new", icon: Plus, writeOnly: true },
    ],
  },
  {
    title: "Personas",
    icon: Users,
    items: [
      { title: "Propietarios", href: "/owners", icon: UserRoundCheck },
      { title: "Clientes", href: "/clients", icon: UserRound },
      { title: "Leads", href: "/leads", icon: UserRoundPlus },
    ],
  },
  {
    title: "Comercial",
    icon: Handshake,
    items: [
      { title: "Oportunidades", href: "/opportunities", icon: Target },
      { title: "Visitas", href: "/visits", icon: MapPin },
      { title: "Seguimientos", href: "/activities", icon: ListChecks },
      { title: "Tareas", href: "/tasks", icon: SquareCheckBig },
      { title: "Cierres", href: "/closings", icon: FileSignature },
    ],
  },
  {
    title: "Sitio web",
    icon: Globe,
    items: [
      { title: "Blog", href: "/blog-posts", icon: Newspaper },
      { title: "Nuevo artículo", href: "/blog-posts/new", icon: SquarePen, writeOnly: true },
    ],
  },
  {
    title: "Equipo",
    icon: UsersRound,
    adminOnly: true,
    items: [
      { title: "Agentes", href: "/team/agents", icon: Contact },
      { title: "Usuarios", href: "/team/users", icon: CircleUserRound },
      { title: "Roles", href: "/team/roles", icon: ShieldCheck },
    ],
  },
];

export const BOTTOM_LINKS: NavLink[] = [{ title: "Configuración", href: "/settings", icon: Settings }];
