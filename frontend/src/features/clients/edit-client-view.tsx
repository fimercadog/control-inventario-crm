"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ClientForm, clientToFormValues } from "@/features/clients/client-form";
import { fetchClient, updateClient } from "@/features/clients/api";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { ApiError } from "@/types/api";
import type { Client } from "@/types/client";
import type { ClientFormOutput } from "@/features/clients/client-form-schema";

export function EditClientView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchClient(clientId)
      .then((data) => {
        if (!ignore) setClient(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el cliente");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [clientId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: ClientFormOutput) {
    try {
      await updateClient(clientId, values);
      toast.success("Cliente actualizado correctamente");
      router.push("/clients");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el cliente");
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (error || !client) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <ClientForm defaultValues={clientToFormValues(client)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>

      <DocumentsPanel subjectType="client" subjectId={client.id} />
    </div>
  );
}
