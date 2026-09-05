"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { Deal } from "@/lib/types";

const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospeccion",
  qualification: "Calificacion",
  proposal: "Propuesta",
  negotiation: "Negociacion",
  won: "Ganado",
  lost: "Perdido",
};

const columns: AppColumnDef<Deal>[] = [
  { accessorKey: "title", header: "Titulo" },
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? `#${row.original.client_id}` },
  { header: "Monto", cell: ({ row }) => `$${Number(row.original.amount).toLocaleString("es-CO")}` },
  { header: "Etapa", cell: ({ row }) => <Badge>{STAGE_LABEL[row.original.stage] ?? row.original.stage}</Badge> },
  dateColumn<Deal>("expected_close_date", "Cierre esperado"),
];

const fields: CrudField[] = [
  { name: "client_id", label: "ID cliente", type: "number", required: true, min: 1, hint: "ID de un cliente existente" },
  { name: "title", label: "Titulo", required: true, colSpan: "full" },
  { name: "amount", label: "Monto", type: "number", required: true, min: 0, step: 1000 },
  {
    name: "stage",
    label: "Etapa",
    type: "select",
    required: true,
    options: Object.entries(STAGE_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "expected_close_date", label: "Cierre esperado", type: "date", omitWhenEmpty: true },
];

export default function DealsPage() {
  return (
    <ModuleTablePage<Deal>
      title="Deals"
      description="Pipeline de oportunidades de venta."
      resource="/deals"
      exportResource="deals"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo deal"
      modalDescription="Oportunidad de venta asociada a un cliente."
    />
  );
}
