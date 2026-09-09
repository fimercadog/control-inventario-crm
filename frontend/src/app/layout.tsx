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
    default: "VetPanel | Software de gestión para clínicas veterinarias",
    template: "%s | VetPanel",
  },
  description: "Software de gestión para veterinarias: propietarios, pacientes, historia clínica, citas, vacunas, inventario y reportes en una sola plataforma.",
  openGraph: {
    title: "VetPanel — Software para clínicas veterinarias",
    description: "Propietarios, pacientes, historia clínica, agenda, vacunas e inventario en una sola plataforma.",
    type: "website",
    locale: "es_CO",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "VetPanel — Software para clínicas veterinarias",
    description: "Gestión clínica e inventario en una sola plataforma para veterinarias.",
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
