"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";

export function ProductImageAction({ product, onDone }: { product: Product; onDone: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setError("");
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next ? URL.createObjectURL(next) : null;
    });
  }

  function close(next: boolean) {
    if (!next) {
      setFile(null);
      setError("");
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    setOpen(next);
  }

  async function upload() {
    if (!file) return;
    setSaving(true);
    setError("");
    const body = new FormData();
    body.append("image", file);
    try {
      await api.post(`/products/${product.id}/image`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Imagen actualizada");
      onDone();
      close(false);
    } catch (err) {
      const res = (err as { response?: { status?: number; data?: { errors?: { image?: string[] }; message?: string } } }).response;
      setError(res?.data?.errors?.image?.[0] ?? res?.data?.message ?? "No se pudo subir la imagen.");
    } finally {
      setSaving(false);
    }
  }

  const current = preview ?? product.image_url ?? null;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <ImageIcon className="h-4 w-4" /> Imagen
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imagen de {product.name}</DialogTitle>
            <DialogDescription>JPG, PNG o WEBP, hasta 2 MB. Se muestra en el catalogo publico.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid aspect-video place-items-center overflow-hidden rounded-md border border-border bg-muted">
              {current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current} alt={product.name} className="size-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">Sin imagen</span>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={pick}
              className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm"
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={upload} disabled={!file || saving}>
              {saving ? "Subiendo..." : "Subir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
