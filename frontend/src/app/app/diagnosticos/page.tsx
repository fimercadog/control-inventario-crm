"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Diagnosis } from "@/lib/types";

const columns: AppColumnDef<Diagnosis>[] = [
  {
    header: "Código CIE-10",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary border border-primary/20">
        {row.original.code || "S/C"}
      </span>
    ),
  },
  { accessorKey: "name", header: "Diagnóstico Clínico" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} label={row.original.status === "active" ? "Activo" : "Inactivo"} /> },
];

const fields: CrudField[] = [
  { name: "code", label: "Código CIE-10", required: true, placeholder: "Ej. A09.9, I10, J06.9, M54.5" },
  { name: "name", label: "Nombre / Descripción del Diagnóstico", required: true, placeholder: "Ej. Gastroenteritis y colitis de origen no especificado" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "active" },
      { label: "Inactivo", value: "inactive" },
    ],
  },
];

export default function DiagnosesPage() {
  return (
    <ModuleTablePage<Diagnosis>
      title="Diagnósticos CIE-10"
      description="Catálogo de la Clasificación Internacional de Enfermedades (CIE-10) para el registro asistencial y la Historia Clínica SOAP."
      resource="/diagnoses"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo diagnóstico CIE-10"
    />
  );
}
