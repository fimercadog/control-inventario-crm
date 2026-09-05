"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Client } from "@/lib/types";

const columns: AppColumnDef<Client>[] = [
  { accessorKey: "name", header: "Nombre" },
  { header: "Empresa", cell: ({ row }) => row.original.company_name ?? "—" },
  { header: "Correo", cell: ({ row }) => row.original.email ?? "—" },
  { header: "Telefono", cell: ({ row }) => row.original.phone ?? "—" },
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.status === "active" ? "Activo" : "Inactivo"}</Badge> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "company_name", label: "Empresa", omitWhenEmpty: true },
  { name: "email", label: "Correo", type: "email", omitWhenEmpty: true },
  { name: "phone", label: "Telefono", omitWhenEmpty: true },
  { name: "address", label: "Direccion", omitWhenEmpty: true, colSpan: "full" },
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
  { name: "notes", label: "Notas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function ClientsPage() {
  return (
    <ModuleTablePage<Client>
      title="Clientes"
      description="Cartera de clientes del CRM, con busqueda y exportacion."
      resource="/clients"
      exportResource="clients"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo cliente"
      modalDescription="Datos de contacto del cliente."
    />
  );
}
