import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

export function DeleteDialog({ open, onOpenChange, resourceName, isSubmitting, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar este registro?"
      description={
        resourceName
          ? `Esta acción eliminará "${resourceName}" de forma permanente. No se puede deshacer.`
          : "Esta acción es permanente y no se puede deshacer."
      }
      confirmLabel="Eliminar"
      variant="destructive"
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
    />
  );
}
