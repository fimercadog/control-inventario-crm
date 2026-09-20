"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Breed } from "@/lib/types";

const columns: AppColumnDef<Breed>[] = [
  { accessorKey: "name", header: "Especialidad / Subzona" },
  { header: "Zona Principal", cell: ({ row }) => row.original.species ?? "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre de subzona / especialidad", required: true },
  { name: "species_id", label: "Zona Principal", type: "select", optionsResource: "/species", required: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activa", value: "active" },
      { label: "Inactiva", value: "inactive" },
    ],
  },
];

export default function BreedsPage() {
  return (
    <ModuleTablePage<Breed>
      title="Especialidades & Subzonas"
      description="Subzonas y áreas de tratamiento específicas por zona principal."
      resource="/breeds"
      columns={columns}
      fields={fields}
      actionLabel="Nueva subzona"
      modalDescription="Elige la zona principal a la que pertenece la subzona."
    />
  );
}
