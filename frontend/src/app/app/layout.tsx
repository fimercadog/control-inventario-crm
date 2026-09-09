import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/admin-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { ContingencyProvider } from "@/lib/contingency/context";
import { Toaster } from "sonner";

// Panel privado: sobreescribe el titulo por defecto del layout raiz (que
// sigue describiendo el sitio publico de marketing, sin tocar).
export const metadata: Metadata = {
  title: { absolute: "Panel | VetPanel" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ContingencyProvider>
        <AdminShell>{children}</AdminShell>
      </ContingencyProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
