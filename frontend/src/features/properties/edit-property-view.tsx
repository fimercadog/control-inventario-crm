"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { PropertyForm, propertyToFormValues } from "@/features/properties/property-form";
import { PropertyImagesPanel } from "@/features/properties/property-images-panel";
import { fetchProperty, updateProperty } from "@/features/properties/api";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { ApiError } from "@/types/api";
import type { Property, PropertyImage } from "@/types/property";
import type { PropertyFormOutput } from "@/features/properties/property-form-schema";

export function EditPropertyView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const propertyId = Number(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchProperty(propertyId)
      .then((data) => {
        if (!ignore) setProperty(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar la propiedad");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [propertyId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  function handleImagesChange(images: PropertyImage[]) {
    setProperty((current) => (current ? { ...current, images } : current));
  }

  async function handleSubmit(values: PropertyFormOutput) {
    try {
      await updateProperty(propertyId, values);
      toast.success("Propiedad actualizada correctamente");
      router.push("/properties");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar la propiedad");
    }
  }

  if (isLoading) {
    return <LoadingState rows={8} />;
  }

  if (error || !property) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <PropertyForm defaultValues={propertyToFormValues(property)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>

      <PropertyImagesPanel propertyId={property.id} images={property.images ?? []} onChange={handleImagesChange} />

      <DocumentsPanel subjectType="property" subjectId={property.id} />
    </div>
  );
}
