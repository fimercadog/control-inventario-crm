"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { ToggleCompleteAction } from "@/components/crud/toggle-complete-action";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { activityFields } from "@/lib/activity-fields";
import { ActivityRow } from "@/lib/types";

const columns: AppColumnDef<ActivityRow>[] = [
  { accessorKey: "subject", header: "Asunto" },
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? "—" },
  dateColumn<ActivityRow>("due_date", "Proximo contacto"),
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.completed ? "Hecho" : "Pendiente"}</Badge> },
];

export default function FollowUpsPage() {
  return (
    <ModuleTablePage<ActivityRow>
      title="Seguimientos"
      description="Recordatorios de cuando volver a contactar a cada cliente."
      resource="/activities"
      params={{ type: "followup" }}
      columns={columns}
      fields={activityFields(["followup"])}
      actionLabel="Nuevo seguimiento"
      modalDescription="Define la fecha del proximo contacto."
      editable={false}
      extraRowActions={(row, refresh) => (
        <ToggleCompleteAction resource="/activities" id={row.id} completed={row.completed} refresh={refresh} />
      )}
    />
  );
}
