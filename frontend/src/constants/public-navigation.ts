export interface PublicNavLink {
  title: string;
  href: string;
}

export const PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { title: "Inicio", href: "/" },
  { title: "Propiedades", href: "/propiedades" },
  { title: "Comprar", href: "/comprar" },
  { title: "Arrendar", href: "/arrendar" },
  { title: "Nosotros", href: "/nosotros" },
  { title: "Blog", href: "/blog" },
  { title: "Contacto", href: "/contacto" },
];
