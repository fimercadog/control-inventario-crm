import type { Metadata } from "next";
import { Poppins, Roboto, Roboto_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Titulares del sitio publico (rama plan/base — look "App Developer").
// Solo lo consume `.site-theme` en globals.css; el panel sigue en Roboto.
const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CRM + Inventario | CRM y control de inventario para PYMES",
    template: "%s | CRM + Inventario",
  },
  description: "CRM y control de inventario conectados: leads, clientes, deals, productos, bodegas, pedidos de venta, compras, reportes e IA.",
  openGraph: {
    title: "CRM + Control de Inventario",
    description: "El pedido de venta descuenta stock de la bodega al confirmarse. CRM e inventario en una sola plataforma.",
    type: "website",
    locale: "es_CO",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRM + Control de Inventario",
    description: "CRM e inventario en una sola plataforma para PYMES.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
