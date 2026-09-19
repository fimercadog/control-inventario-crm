"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageOff, Loader2, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deletePropertyImage, setPropertyImageCover, uploadPropertyImage } from "@/features/properties/images-api";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiError } from "@/types/api";
import type { PropertyImage } from "@/types/property";

// Mirrors StorePropertyImageRequest's server-side rules (image, mimes,
// max:5120 KB) so an obviously-invalid file is rejected before a slow
// upload, not after one.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "La imagen supera el tamaño máximo permitido (5 MB).";
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Formato no permitido. Usa JPG, PNG o WEBP.";
  }
  return null;
}

interface PropertyImagesPanelProps {
  propertyId: number;
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

export function PropertyImagesPanel({ propertyId, images, onChange }: PropertyImagesPanelProps) {
  const { canWrite, isAdmin } = usePermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PropertyImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const image = await uploadPropertyImage(propertyId, file);
      onChange([...images, image]);
      toast.success("Imagen cargada correctamente");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible cargar la imagen");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetCover(image: PropertyImage) {
    try {
      await setPropertyImageCover(propertyId, image.id);
      onChange(images.map((item) => ({ ...item, is_cover: item.id === image.id })));
      toast.success("Portada actualizada");
    } catch {
      toast.error("No fue posible actualizar la portada");
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deletePropertyImage(propertyId, pendingDelete.id);
      const wasCover = pendingDelete.is_cover;
      const remaining = images.filter((item) => item.id !== pendingDelete.id);
      onChange(wasCover && remaining.length > 0 ? remaining.map((item, i) => ({ ...item, is_cover: i === 0 })) : remaining);
      toast.success("Imagen eliminada correctamente");
      setPendingDelete(null);
    } catch {
      toast.error("No fue posible eliminar la imagen");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Fotos</CardTitle>
          <CardDescription>Galería de imágenes públicas de la propiedad.</CardDescription>
        </div>
        {canWrite && (
          <>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileSelected} />
            <Button size="sm" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              Subir foto
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {images.length === 0 && (
          <EmptyState icon={ImageOff} title="Sin fotos" description="Todavía no se han cargado imágenes." />
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                <Image src={image.url} alt={image.alt ?? "Foto de la propiedad"} fill className="object-cover" sizes="200px" />
                {image.is_cover && (
                  <span className="absolute top-2 left-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Portada
                  </span>
                )}
                {canWrite && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {!image.is_cover && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-7"
                        aria-label="Marcar como portada"
                        onClick={() => handleSetCover(image)}
                      >
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="size-7"
                        aria-label="Eliminar"
                        onClick={() => setPendingDelete(image)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resourceName="esta foto"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
