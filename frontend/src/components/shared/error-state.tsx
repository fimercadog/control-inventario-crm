import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "No fue posible cargar la información",
  description = "Ocurrió un error al comunicarse con el servidor. Intenta nuevamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
