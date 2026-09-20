import type { Metadata } from "next";
import { Nunito, Open_Sans, Poppins, Roboto, Roboto_Mono } from "next/font/google";
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

// Tipografía real del pack Divi "Veterinarian" (extraída del live-demo via
// getComputedStyle, no una aproximación): Nunito para títulos/botones,
// Open Sans para texto de cuerpo. Solo se consumen dentro de `.site-theme`
// (sitio público + login) -- el panel /app/* sigue en Roboto sin tocar.
const nunito = Nunito({
  variable: "--font-heading-marketing",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-body-marketing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fuente del navbar en el live-demo (getComputedStyle exacto: "Poppins, Helvetica, Arial, Lucida, sans-serif").
const poppins = Poppins({
  variable: "--font-nav-marketing",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Viajes Globales | Agencia de Viajes, Paquetes Turísticos & CRM",
    template: "%s | Viajes Globales",
  },
  description:
    "Plataforma integral para agencias de viajes: reservas de vuelos, hoteles, paquetes turísticos, itinerarios, gestión de viajeros y facturación de turismo.",
  openGraph: {
    title: "Viajes Globales — Agencia de Viajes & Turismo Internacional",
    description: "Gestión completa de paquetes turísticos, reservas, itinerarios de viaje, hoteles y atención personalizada a viajeros.",
    type: "website",
    locale: "es_CO",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viajes Globales — Agencia de Viajes & Turismo Internacional",
    description: "Gestión completa de reservas, itinerarios, paquetes y experiencia del viajero.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} ${nunito.variable} ${openSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
