"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { ActivityRow } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = { call: "Llamada", meeting: "Reunion", email: "Correo", note: "Nota" };

const columns: AppColumnDef<ActivityRow>[] = [
  { accessorKey: "subject", header: "Asunto" },
  { header: "Tipo", cell: ({ row }) => <Badge>{TYPE_LABEL[row.original.type] ?? row.original.type}</Badge> },
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? (row.original.client_id ? `#${row.original.client_id}` : "—") },
  dateColumn<ActivityRow>("due_date", "Vencimiento"),
  { header: "Completada", cell: ({ row }) => <Badge>{row.original.completed ? "Si" : "No"}</Badge> },
];

const fields: CrudField[] = [
  { name: "client_id", label: "ID cliente", type: "number", min: 1, omitWhenEmpty: true, hint: "ID de un cliente existente" },
  { name: "deal_id", label: "ID deal", type: "number", min: 1, omitWhenEmpty: true, hint: "ID de un deal existente" },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "subject", label: "Asunto", required: true, colSpan: "full" },
  { name: "due_date", label: "Vencimiento", type: "date", omitWhenEmpty: true },
  {
    name: "completed",
    label: "Completada",
    type: "select",
    required: true,
    options: [
      { label: "No", value: "0" },
      { label: "Si", value: "1" },
    ],
  },
  { name: "notes", label: "Notas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function ActivitiesPage() {
  return (
    <ModuleTablePage<ActivityRow>
      title="Actividades"
      description="Seguimiento comercial: llamadas, reuniones y notas por cliente o deal."
      resource="/activities"
      columns={columns}
      fields={fields}
      actionLabel="Nueva actividad"
      modalDescription="Registro de seguimiento comercial."
    />
  );
}
