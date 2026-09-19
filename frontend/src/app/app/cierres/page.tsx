import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ClosingsTable } from "@/features/closings/closings-table";

export default function ClosingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Cierres"
        description="Negocios ganados y perdidos."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Cierres" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <ClosingsTable />
      </Suspense>
    </PageContainer>
  );
}
