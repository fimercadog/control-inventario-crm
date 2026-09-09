"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Breed } from "@/lib/types";

const columns: AppColumnDef<Breed>[] = [
  { accessorKey: "name", header: "Nombre" },
  { header: "Especie", cell: ({ row }) => row.original.species ?? "—" },
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.status === "active" ? "Activa" : "Inactiva"}</Badge> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "species_id", label: "Especie", type: "select", optionsResource: "/species", required: true },
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
      title="Razas"
      description="Razas por especie."
      resource="/breeds"
      columns={columns}
      fields={fields}
      actionLabel="Nueva raza"
      modalDescription="Elegí la especie a la que pertenece la raza."
    />
  );
}
