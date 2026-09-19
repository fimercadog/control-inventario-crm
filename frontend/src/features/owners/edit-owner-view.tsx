"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { OwnerForm, ownerToFormValues } from "@/features/owners/owner-form";
import { fetchOwner, updateOwner } from "@/features/owners/api";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { ApiError } from "@/types/api";
import type { Owner } from "@/types/owner";
import type { OwnerFormOutput } from "@/features/owners/owner-form-schema";

export function EditOwnerView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ownerId = Number(params.id);

  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchOwner(ownerId)
      .then((data) => {
        if (!ignore) setOwner(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el propietario");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [ownerId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: OwnerFormOutput) {
    try {
      await updateOwner(ownerId, values);
      toast.success("Propietario actualizado correctamente");
      router.push("/owners");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el propietario");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !owner) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <OwnerForm defaultValues={ownerToFormValues(owner)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>

      <DocumentsPanel subjectType="owner" subjectId={owner.id} />
    </div>
  );
}
