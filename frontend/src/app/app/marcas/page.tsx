"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Brand } from "@/lib/types";

const columns: AppColumnDef<Brand>[] = [
  { accessorKey: "name", header: "Nombre" },
  { header: "Productos", cell: ({ row }) => row.original.products_count ?? 0 },
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.status === "active" ? "Activa" : "Inactiva"}</Badge> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre", required: true },
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

export default function BrandsPage() {
  return (
    <ModuleTablePage<Brand>
      title="Marcas"
      description="Fabricante o marca de cada producto."
      resource="/brands"
      columns={columns}
      fields={fields}
      actionLabel="Nueva marca"
      modalDescription="Clasifica productos por marca para filtrar y reportar."
    />
  );
}
