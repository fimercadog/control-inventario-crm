"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { AppColumnDef, dateColumn } from "@/lib/table-types";
import { ClientNote } from "@/lib/types";

const columns: AppColumnDef<ClientNote>[] = [
  dateColumn<ClientNote>("created_at", "Fecha"),
  { header: "Cliente", cell: ({ row }) => row.original.client ?? "—" },
  { header: "Nota", cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.body}</span> },
  { header: "Autor", cell: ({ row }) => row.original.author ?? "—" },
];

const fields: CrudField[] = [
  { name: "client_id", label: "Cliente", type: "select", optionsResource: "/clients", required: true },
  { name: "body", label: "Nota", type: "textarea", colSpan: "full", required: true },
];

export default function ClientNotesPage() {
  return (
    <ModuleTablePage<ClientNote>
      title="Notas"
      description="Bitacora comercial de cada cliente."
      resource="/client-notes"
      columns={columns}
      fields={fields}
      actionLabel="Nueva nota"
      modalDescription="Queda registrada con tu nombre y la fecha."
      editable={false}
    />
  );
}
