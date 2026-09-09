"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { AppColumnDef } from "@/lib/table-types";
import { Procedure } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const columns: AppColumnDef<Procedure>[] = [
  { header: "Fecha", cell: ({ row }) => formatDate(row.original.performed_at) },
  {
    header: "Paciente",
    cell: ({ row }) => (
      <Link href={`/app/pacientes/${row.original.patient_id}`} className="text-primary hover:underline">
        {row.original.patient ?? "—"}
      </Link>
    ),
  },
  { accessorKey: "type", header: "Procedimiento" },
  { header: "Veterinario", cell: ({ row }) => row.original.vet ?? "—" },
  { header: "Consentimiento", cell: ({ row }) => (row.original.consent_document_url ? "Adjunto" : "—") },
];

const fields: CrudField[] = [
  { name: "patient_id", label: "Paciente", type: "select", optionsResource: "/patients", required: true },
  { name: "service_id", label: "Servicio asociado", type: "select", optionsResource: "/services", omitWhenEmpty: true },
  { name: "type", label: "Procedimiento", required: true },
  { name: "performed_at", label: "Fecha", type: "date", required: true },
  { name: "notes", label: "Notas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function ProceduresPage() {
  return (
    <ModuleTablePage<Procedure>
      title="Procedimientos"
      description="Cirugías, curaciones y otros procedimientos realizados."
      resource="/procedures"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo procedimiento"
    />
  );
}
