"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { OpportunityForm, opportunityToFormValues } from "@/features/opportunities/opportunity-form";
import { fetchOpportunity, updateOpportunity } from "@/features/opportunities/api";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { ApiError } from "@/types/api";
import type { Opportunity } from "@/types/opportunity";
import type { OpportunityFormOutput } from "@/features/opportunities/opportunity-form-schema";

export function EditOpportunityView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const opportunityId = Number(params.id);

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchOpportunity(opportunityId)
      .then((data) => {
        if (!ignore) setOpportunity(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar la oportunidad");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [opportunityId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: OpportunityFormOutput) {
    try {
      await updateOpportunity(opportunityId, values);
      toast.success("Oportunidad actualizada correctamente");
      router.push("/opportunities");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar la oportunidad");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !opportunity) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <OpportunityForm
            defaultValues={opportunityToFormValues(opportunity)}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>

      <DocumentsPanel subjectType="opportunity" subjectId={opportunity.id} />
    </div>
  );
}
