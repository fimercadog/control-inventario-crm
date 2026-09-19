import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { PropertiesTable } from "@/features/properties/properties-table";

export default function PropertiesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Propiedades"
        description="Administra las propiedades de la inmobiliaria."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Propiedades" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <PropertiesTable />
      </Suspense>
    </PageContainer>
  );
}
