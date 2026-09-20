"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Species } from "@/lib/types";

const columns: AppColumnDef<Species>[] = [
  { accessorKey: "name", header: "Nombre de la zona" },
  { header: "Especialidades / Subzonas", cell: ({ row }) => row.original.breeds_count ?? 0 },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre de la zona", required: true },
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

export default function SpeciesPage() {
  return (
    <ModuleTablePage<Species>
      title="Zonas Anatómicas Estéticas"
      description="Categorías principales de la clínica (Facial, Corporal, Capilar, Antiaging)."
      resource="/species"
      columns={columns}
      fields={fields}
      actionLabel="Nueva zona"
      modalDescription="Categorías anatómicas principales para organizar los tratamientos de la clínica."
    />
  );
}
