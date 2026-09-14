import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clínica Veterinaria Los Andes | Veterinaria en Bogotá",
    template: "%s | Clínica Veterinaria Los Andes",
  },
  description:
    "Clínica veterinaria en Bogotá: consulta general, vacunación, cirugía, laboratorio clínico y urgencias para perros, gatos y otras mascotas. Agendá tu cita online o por WhatsApp.",
  openGraph: {
    title: "Clínica Veterinaria Los Andes — Veterinaria en Bogotá",
    description: "Consulta, vacunación, cirugía y urgencias para tu mascota, con historia clínica digital por paciente.",
    type: "website",
    locale: "es_CO",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clínica Veterinaria Los Andes — Veterinaria en Bogotá",
    description: "Consulta, vacunación, cirugía y urgencias para tu mascota.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
