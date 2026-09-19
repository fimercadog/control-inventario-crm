import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireWrite } from "@/features/auth/require-write";
import { EditVisitView } from "@/features/visits/edit-visit-view";

export default function EditVisitPage() {
  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Editar visita"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Visitas", href: "/visits" },
            { title: "Editar" },
          ]}
        />
        <Suspense fallback={<LoadingState rows={6} />}>
          <EditVisitView />
        </Suspense>
      </PageContainer>
    </RequireWrite>
  );
}
