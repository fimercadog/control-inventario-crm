import type { Metadata } from "next";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: { absolute: "Iniciar sesión | Viajes Globales" } };

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

const demoEmails: Record<string, string> = {
  superadmin: "superadmin@viajesglobales.test",
  admin: "admin@viajesglobales.test",
  agente: "agente@viajesglobales.test",
  operaciones: "operaciones@viajesglobales.test",
  finanzas: "finanzas@viajesglobales.test",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const initialEmail = demoMode && params.demo ? demoEmails[params.demo] : undefined;

  return (
    <AuthSplitLayout>
      <h1 className="text-2xl font-semibold text-foreground">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {demoMode
          ? "Ingresa con una cuenta demo para acceder al panel de la agencia de viajes."
          : "Ingresa con las credenciales de tu cuenta."}
      </p>
      <LoginForm initialEmail={initialEmail} autoLogin={Boolean(initialEmail)} demoMode={demoMode} />
    </AuthSplitLayout>
  );
}
