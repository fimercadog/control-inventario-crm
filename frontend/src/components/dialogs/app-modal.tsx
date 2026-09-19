import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  confirmVariant?: "default" | "destructive";
}

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  confirmVariant = "default",
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {onConfirm && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
