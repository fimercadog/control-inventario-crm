"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { VisitForm, visitToFormValues } from "@/features/visits/visit-form";
import { fetchVisit, updateVisit } from "@/features/visits/api";
import { ApiError } from "@/types/api";
import type { Visit } from "@/types/visit";
import type { VisitFormOutput } from "@/features/visits/visit-form-schema";

export function EditVisitView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const visitId = Number(params.id);

  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchVisit(visitId)
      .then((data) => {
        if (!ignore) setVisit(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar la visita");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [visitId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: VisitFormOutput) {
    try {
      await updateVisit(visitId, values);
      toast.success("Visita actualizada correctamente");
      router.push("/visits");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar la visita");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !visit) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <VisitForm defaultValues={visitToFormValues(visit)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
      </CardContent>
    </Card>
  );
}
