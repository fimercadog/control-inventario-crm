import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { VisitsTable } from "@/features/visits/visits-table";

export default function VisitsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Visitas"
        description="Visitas agendadas a propiedades con clientes interesados."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Visitas" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <VisitsTable />
      </Suspense>
    </PageContainer>
  );
}
