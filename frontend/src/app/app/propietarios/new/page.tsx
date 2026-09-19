"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { OwnerForm } from "@/features/owners/owner-form";
import { createOwner } from "@/features/owners/api";
import { ApiError } from "@/types/api";
import type { OwnerFormOutput } from "@/features/owners/owner-form-schema";

export default function NewOwnerPage() {
  const router = useRouter();

  async function handleSubmit(values: OwnerFormOutput) {
    try {
      await createOwner(values);
      toast.success("Propietario creado correctamente");
      router.push("/owners");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear el propietario");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nuevo propietario"
          description="Completa la información del propietario."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Propietarios", href: "/owners" },
            { title: "Nuevo" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <OwnerForm onSubmit={handleSubmit} submitLabel="Crear propietario" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
