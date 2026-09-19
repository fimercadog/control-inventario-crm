"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { PropertyForm } from "@/features/properties/property-form";
import { createProperty } from "@/features/properties/api";
import { ApiError } from "@/types/api";
import type { PropertyFormOutput } from "@/features/properties/property-form-schema";

export default function NewPropertyPage() {
  const router = useRouter();

  async function handleSubmit(values: PropertyFormOutput) {
    try {
      const property = await createProperty(values);
      toast.success("Propiedad creada correctamente");
      router.push(`/properties/${property.id}/edit`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear la propiedad");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nueva propiedad"
          description="Completa la información para registrar una nueva propiedad."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Propiedades", href: "/properties" },
            { title: "Nueva" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <PropertyForm onSubmit={handleSubmit} submitLabel="Crear propiedad" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
