"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { isoDateLocal } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/appointments";

type ClinicalReport = {
  range: { from: string; to: string };
  patients_attended: number;
  consultations: number;
  vaccinations_applied: number;
  dewormings_applied: number;
  appointments_by_status: Record<string, number>;
  appointments_by_practitioner: Record<string, number>;
  revenue_by_service: Record<string, number>;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Breakdown({ title, rows, money }: { title: string; rows: Record<string, number>; money?: boolean }) {
  const entries = Object.entries(rows);
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-3 text-base font-medium">{title}</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {entries.map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <span>{k}</span>
                <span className="font-medium tabular-nums">
                  {money ? `$${Number(v).toLocaleString("es-CO")}` : v}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClinicalReportsPage() {
  const monthStart = isoDateLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = isoDateLocal(new Date());
  const [from, setFrom] = React.useState(monthStart);
  const [to, setTo] = React.useState(today);
  const [report, setReport] = React.useState<ClinicalReport | null>(null);

  const load = React.useCallback(() => {
    api
      .get<ClinicalReport>("/reports/clinical", { params: { from, to } })
      .then((r) => setReport(r.data))
      .catch(() => toast.error("No se pudo cargar el reporte."));
  }, [from, to]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Reportes clínicos</h1>
          <p className="text-sm text-muted-foreground">Actividad de la clínica en el período.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-md border border-border bg-card px-2" />
          <span className="text-muted-foreground">a</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-md border border-border bg-card px-2" />
        </div>
      </div>

      {report === null ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Stat label="Pacientes atendidos" value={report.patients_attended} />
            <Stat label="Consultas" value={report.consultations} />
            <Stat label="Vacunas aplicadas" value={report.vaccinations_applied} />
            <Stat label="Desparasitaciones" value={report.dewormings_applied} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Breakdown
              title="Citas por estado"
              rows={Object.fromEntries(
                Object.entries(report.appointments_by_status).map(([k, v]) => [APPOINTMENT_STATUS_LABEL[k] ?? k, v]),
              )}
            />
            <Breakdown title="Citas por profesional" rows={report.appointments_by_practitioner} />
            <Breakdown title="Ingreso estimado por servicio" rows={report.revenue_by_service} money />
          </div>
        </>
      )}
    </div>
  );
}
