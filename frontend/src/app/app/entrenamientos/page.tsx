"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";

type Appointment = {
  id: number;
  starts_at: string;
  ends_at: string;
  reason: string;
  status: string;
  notes?: string;
};

const columns: AppColumnDef<Appointment>[] = [
  { accessorKey: "reason", header: "Sesión / Entrenamiento" },
  { header: "Inicio", cell: ({ row }) => new Date(row.original.starts_at).toLocaleString("es-CO") },
  { header: "Fin", cell: ({ row }) => new Date(row.original.ends_at).toLocaleString("es-CO") },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { header: "Notas", cell: ({ row }) => row.original.notes ?? "—" },
];

const fields: CrudField[] = [
  { name: "reason", label: "Categoría / Cancha", required: true },
  { name: "starts_at", label: "Fecha y Hora Inicio", type: "text", required: true },
  { name: "ends_at", label: "Fecha y Hora Fin", type: "text", required: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Programado", value: "scheduled" },
      { label: "Completado", value: "confirmed" },
      { label: "Cancelado", value: "cancelled" },
    ],
  },
  { name: "notes", label: "Plan de Trabajo / Observaciones", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function TrainingSchedulePage() {
  return (
    <ModuleTablePage<Appointment>
      title="Agenda de Entrenamientos y Canchas"
      description="Programación de sesiones de práctica por categoría, cancha y horario."
      resource="/appointments"
      exportResource="appointments"
      columns={columns}
      fields={fields}
      actionLabel="Programar Entrenamiento"
      modalDescription="Reserva de cancha y sesión de entrenamiento."
    />
  );
}
