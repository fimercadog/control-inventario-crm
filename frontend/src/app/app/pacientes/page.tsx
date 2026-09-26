"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Patient } from "@/lib/types";

const columns: AppColumnDef<Patient>[] = [
  {
    header: "Nombre Alumno",
    cell: ({ row }) => (
      <Link href={`/app/alumnos`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { header: "Acudiente / Padre", cell: ({ row }) => row.original.client ?? "—" },
  { header: "Categoría", cell: ({ row }) => row.original.species ?? "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "client_id", label: "Acudiente", type: "select", optionsResource: "/clients", required: true },
  { name: "name", label: "Nombre Alumno", required: true },
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

export default function PatientsPage() {
  return (
    <ModuleTablePage<Patient>
      title="Alumnos y Canteranos"
      description="Deportistas de la escuela, cada uno vinculado a su acudiente registrado."
      resource="/students"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo alumno"
      modalDescription="Datos del deportista canterano."
    />
  );
}
