"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  client_id: number;
  client?: { name: string; phone?: string };
  team?: { name: string; category_code: string };
  birth_date?: string;
  position?: string;
  shirt_number?: number;
  shirt_size?: string;
  status: string;
};

const columns: AppColumnDef<Student>[] = [
  { header: "Alumno", cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}` },
  { header: "Acudiente", cell: ({ row }) => row.original.client?.name ?? "—" },
  { header: "Categoría", cell: ({ row }) => row.original.team?.name ?? "Sin asignar" },
  { header: "Posición", cell: ({ row }) => row.original.position ?? "—" },
  { header: "Camiseta", cell: ({ row }) => row.original.shirt_number ? `#${row.original.shirt_number}` : "—" },
  { header: "Talla", cell: ({ row }) => row.original.shirt_size ?? "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "client_id", label: "Acudiente / Padre", type: "select", optionsResource: "/clients", required: true },
  { name: "team_id", label: "Categoría / Equipo", type: "select", optionsResource: "/teams", omitWhenEmpty: true },
  { name: "first_name", label: "Nombres del Alumno", required: true },
  { name: "last_name", label: "Apellidos del Alumno", required: true },
  { name: "birth_date", label: "Fecha de Nacimiento", type: "date", omitWhenEmpty: true },
  { name: "identification_number", label: "Documento de Identidad", omitWhenEmpty: true },
  { name: "position", label: "Posición de Juego", omitWhenEmpty: true },
  { name: "shirt_number", label: "Número de Camiseta", type: "number", omitWhenEmpty: true },
  { name: "shirt_size", label: "Talla de Camiseta", omitWhenEmpty: true },
  { name: "rh_factor", label: "Factor RH", omitWhenEmpty: true },
  { name: "eps_health", label: "EPS / Seguro", omitWhenEmpty: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "active" },
      { label: "Inactivo", value: "inactive" },
      { label: "Suspendido", value: "suspended" },
    ],
  },
  { name: "medical_notes", label: "Observaciones Médicas / Físicas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function StudentsPage() {
  return (
    <ModuleTablePage<Student>
      title="Alumnos y Deportistas"
      description="Listado de deportistas inscritos en la Academia de Fútbol Cantera Real."
      resource="/students"
      exportResource="students"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo Alumno"
      modalDescription="Registro completo del deportista y vinculación con acudiente."
    />
  );
}
