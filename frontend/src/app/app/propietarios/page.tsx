import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { OwnersTable } from "@/features/owners/owners-table";

export default function OwnersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Propietarios"
        description="Administra los propietarios y sus propiedades asociadas."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Propietarios" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <OwnersTable />
      </Suspense>
    </PageContainer>
  );
}
