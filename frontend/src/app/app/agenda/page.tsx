"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppointmentStatusAction } from "@/components/crud/appointment-status-action";
import { APPOINTMENT_STATUS_LABEL as STATUS_LABEL } from "@/lib/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { isoDateLocal as isoDate } from "@/lib/utils";
import { Appointment } from "@/lib/types";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export default function AgendaPage() {
  const [date, setDate] = React.useState(() => isoDate(new Date()));
  const [items, setItems] = React.useState<Appointment[] | null>(null);

  const load = React.useCallback(() => {
    api
      .get<{ data: Appointment[] }>("/appointments", { params: { date_from: date, date_to: date, per_page: 100 } })
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error("No se pudo cargar la agenda."));
  }, [date]);

  React.useEffect(() => {
    load();
  }, [load]);

  const loading = items === null;

  function shift(days: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(isoDate(d));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-sm text-muted-foreground">Citas del día. Para el listado completo, usá Citas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)}>
            ←
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-2 text-sm"
          />
          <Button variant="outline" size="sm" onClick={() => shift(1)}>
            →
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDate(isoDate(new Date()))}>
            Hoy
          </Button>
        </div>
      </div>

      {loading || items === null ? (
        <p className="text-sm text-muted-foreground">Cargando agenda...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Sin citas para este día.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="w-16 shrink-0 text-sm font-semibold tabular-nums">{timeLabel(a.starts_at)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {a.patient_id ? (
                      <Link href={`/app/pacientes/${a.patient_id}`} className="text-primary hover:underline">
                        {a.patient ?? "Paciente"}
                      </Link>
                    ) : (
                      a.patient
                    )}
                    {a.client ? <span className="text-muted-foreground"> · {a.client}</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[a.service, a.practitioner, a.resource, a.reason].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <Badge>{STATUS_LABEL[a.status] ?? a.status}</Badge>
                <AppointmentStatusAction appointment={a} onDone={load} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
