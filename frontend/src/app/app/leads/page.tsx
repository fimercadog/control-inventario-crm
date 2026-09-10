"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";

type Lead = {
  id: number;
  name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  employee_count: string | null;
  priority_module: string | null;
  message: string | null;
  source: "contact" | "demo" | "catalog" | "manual" | "appointment";
  status: "new" | "contacted" | "discarded";
  created_at: string;
};

const SOURCE_LABEL: Record<Lead["source"], string> = {
  contact: "Contacto",
  demo: "Demo",
  catalog: "Cotizacion",
  manual: "Manual",
  appointment: "Solicitud de cita",
};
const STATUS_LABEL: Record<Lead["status"], string> = { new: "Nuevo", contacted: "Contactado", discarded: "Descartado" };

const columns: AppColumnDef<Lead>[] = [
  { accessorKey: "name", header: "Nombre" },
  { header: "Empresa", cell: ({ row }) => row.original.company_name ?? "—" },
  { accessorKey: "email", header: "Correo" },
  { header: "Telefono", cell: ({ row }) => row.original.phone ?? "—" },
  { header: "Origen", cell: ({ row }) => <Badge>{SOURCE_LABEL[row.original.source]}</Badge> },
  { header: "Estado", cell: ({ row }) => <Badge>{STATUS_LABEL[row.original.status]}</Badge> },
  {
    header: "Recibido",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
  },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "company_name", label: "Empresa" },
  { name: "email", label: "Correo", type: "email", required: true },
  { name: "phone", label: "Telefono" },
  { name: "message", label: "Mensaje", type: "textarea", colSpan: "full" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Nuevo", value: "new" },
      { label: "Contactado", value: "contacted" },
      { label: "Descartado", value: "discarded" },
    ],
  },
];

export default function LeadsPage() {
  return (
    <ModuleTablePage<Lead>
      title="Leads"
      description="Solicitudes de demo y mensajes de contacto del sitio publico."
      resource="/leads"
      actionLabel="Crear lead"
      columns={columns}
      fields={fields}
      modalDescription="Datos de contacto y estado del seguimiento comercial."
    />
  );
}
