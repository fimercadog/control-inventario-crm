import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireWrite } from "@/features/auth/require-write";
import { EditOwnerView } from "@/features/owners/edit-owner-view";

export default function EditOwnerPage() {
  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Editar propietario"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Propietarios", href: "/owners" },
            { title: "Editar" },
          ]}
        />
        <Suspense fallback={<LoadingState rows={6} />}>
          <EditOwnerView />
        </Suspense>
      </PageContainer>
    </RequireWrite>
  );
}
