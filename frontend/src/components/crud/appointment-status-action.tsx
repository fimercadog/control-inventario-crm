"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Appointment } from "@/lib/types";

const NEXT: Record<string, { action: string; label: string }[]> = {
  scheduled: [
    { action: "confirm", label: "Confirmar" },
    { action: "attended", label: "Atendida" },
    { action: "no-show", label: "No asistió" },
    { action: "cancel", label: "Cancelar" },
  ],
  confirmed: [
    { action: "attended", label: "Atendida" },
    { action: "no-show", label: "No asistió" },
    { action: "cancel", label: "Cancelar" },
  ],
};

export function AppointmentStatusAction({ appointment, onDone }: { appointment: Appointment; onDone: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const options = NEXT[appointment.status] ?? [];
  if (options.length === 0) return null;

  async function run(action: string) {
    setBusy(true);
    try {
      await api.post(`/appointments/${appointment.id}/${action}`);
      toast.success("Cita actualizada");
      onDone();
    } catch {
      toast.error("No se pudo cambiar el estado de la cita.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <Button key={o.action} variant="ghost" size="sm" disabled={busy} onClick={() => run(o.action)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}
