"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteDocument, downloadDocument, fetchDocuments, uploadDocument } from "@/features/documents/api";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiError } from "@/types/api";
import type { CrmDocument, DocumentSubjectType } from "@/types/document";

// Mirrors StoreDocumentRequest's server-side rules (mimes + max:10240 KB) so
// an obviously-invalid file is rejected before a slow upload, not after one.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"];

function validateDocumentFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "El archivo supera el tamaño máximo permitido (10 MB).";
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Tipo de archivo no permitido. Usa PDF, Word, Excel o una imagen (JPG/PNG).";
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

interface DocumentsPanelProps {
  subjectType: DocumentSubjectType;
  subjectId: number;
}

export function DocumentsPanel({ subjectType, subjectId }: DocumentsPanelProps) {
  const { canWrite, isAdmin } = usePermissions();
  const [documents, setDocuments] = useState<CrmDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CrmDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchDocuments(subjectType, subjectId)
      .then((data) => {
        if (!ignore) setDocuments(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar los documentos");
      });

    return () => {
      ignore = true;
    };
  }, [subjectType, subjectId, retryToken]);

  function handleRetry() {
    setDocuments(null);
    setError(null);
    loadDocuments();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(subjectType, subjectId, file);
      toast.success("Documento cargado correctamente");
      loadDocuments();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible cargar el documento");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(document: CrmDocument) {
    try {
      await downloadDocument(document.id, document.name);
    } catch {
      toast.error("No fue posible descargar el documento");
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteDocument(pendingDelete.id);
      toast.success("Documento eliminado correctamente");
      setPendingDelete(null);
      loadDocuments();
    } catch {
      toast.error("No fue posible eliminar el documento");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Archivos adjuntos a este registro.</CardDescription>
        </div>
        {canWrite && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileSelected}
            />
            <Button size="sm" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              Subir documento
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {documents === null && !error && <LoadingState rows={2} />}
        {error && <ErrorState description={error} onRetry={handleRetry} />}
        {documents !== null && !error && documents.length === 0 && (
          <EmptyState icon={FileText} title="Sin documentos" description="Todavía no se han cargado archivos." />
        )}
        {documents !== null && !error && documents.length > 0 && (
          <ul className="flex flex-col divide-y">
            {documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="text-muted-foreground size-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{document.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(document.size)} · {dateFormatter.format(new Date(document.created_at))}
                      {document.uploaded_by ? ` · ${document.uploaded_by}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label="Descargar" onClick={() => handleDownload(document)}>
                    <Download className="size-4" />
                  </Button>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => setPendingDelete(document)}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resourceName={pendingDelete?.name}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
