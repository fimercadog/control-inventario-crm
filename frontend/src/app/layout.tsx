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
    default: "Clínica Estética & Medicina Antiaging Élite",
    template: "%s | Clínica Estética Élite",
  },
  description:
    "Clínica de Medicina Estética & Antiaging Élite: Toxina Botulínica (Botox), Ácido Hialurónico, Bioestimuladores de Colágeno, Peeling Médico, Hydrafacial y Contorno Corporal. Reserva tu valoración médica.",
  openGraph: {
    title: "Clínica Estética & Medicina Antiaging Élite",
    description: "Medicina estética avanzada, armonización facial, rejuvenecimiento y salud cutánea con médicos especialistas.",
    type: "website",
    locale: "es_CO",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clínica Estética & Medicina Antiaging Élite",
    description: "Medicina estética avanzada, armonización facial y salud cutánea.",
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
