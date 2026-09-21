"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ResetPasswordForm } from "./reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  return (
    <AuthSplitLayout>
      <h1 className="text-2xl font-semibold text-foreground">Elegir nueva contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">Escribe una contraseña nueva para tu cuenta.</p>
      <ResetPasswordForm token={token} email={email} />
    </AuthSplitLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Cargando...</p>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
