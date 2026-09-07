"use client";

import { Check, Undo2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

/** Marca una actividad como completada / pendiente (PATCH { completed }). */
export function ToggleCompleteAction({
  resource,
  id,
  completed,
  refresh,
}: {
  resource: string;
  id: number | string;
  completed: boolean;
  refresh: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await api.put(`${resource}/${id}`, { completed: !completed });
      toast.success(completed ? "Marcada como pendiente" : "Marcada como completada");
      refresh();
    } catch {
      toast.error("No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading}>
      {completed ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      {completed ? "Reabrir" : "Completar"}
    </Button>
  );
}
