"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { VisitForm } from "@/features/visits/visit-form";
import { createVisit } from "@/features/visits/api";
import { ApiError } from "@/types/api";
import type { VisitFormOutput } from "@/features/visits/visit-form-schema";

export default function NewVisitPage() {
  const router = useRouter();

  async function handleSubmit(values: VisitFormOutput) {
    try {
      await createVisit(values);
      toast.success("Visita agendada correctamente");
      router.push("/visits");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible agendar la visita");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nueva visita"
          description="Agenda una visita a una propiedad con un cliente."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Visitas", href: "/visits" },
            { title: "Nueva" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <VisitForm onSubmit={handleSubmit} submitLabel="Agendar visita" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
