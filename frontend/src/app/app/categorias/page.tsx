"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";

type Team = {
  id: number;
  name: string;
  category_code: string;
  min_age: number;
  max_age: number;
  coach_name?: string;
  training_schedule?: string;
  monthly_fee: number;
  students_count?: number;
  status: string;
};

const columns: AppColumnDef<Team>[] = [
  { accessorKey: "name", header: "Nombre de Categoría" },
  { accessorKey: "category_code", header: "Código" },
  { header: "Edades", cell: ({ row }) => `${row.original.min_age} - ${row.original.max_age} años` },
  { header: "Entrenador", cell: ({ row }) => row.original.coach_name ?? "—" },
  { header: "Horario", cell: ({ row }) => row.original.training_schedule ?? "—" },
  { header: "Mensualidad", cell: ({ row }) => `$${Number(row.original.monthly_fee).toLocaleString("es-CO")}` },
  { header: "Alumnos", cell: ({ row }) => row.original.students_count ?? 0 },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre de la Categoría", required: true },
  { name: "category_code", label: "Código de Categoría (ej. SUB-12)", required: true },
  { name: "min_age", label: "Edad Mínima", type: "number", required: true },
  { name: "max_age", label: "Edad Máxima", type: "number", required: true },
  { name: "coach_name", label: "Nombre del Entrenador", omitWhenEmpty: true },
  { name: "training_schedule", label: "Horarios de Entrenamiento", omitWhenEmpty: true, colSpan: "full" },
  { name: "monthly_fee", label: "Valor Mensualidad ($)", type: "number", required: true },
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

export default function TeamsPage() {
  return (
    <ModuleTablePage<Team>
      title="Categorías y Equipos por Edad"
      description="Gestión de categorías deportivas, horarios de entrenamiento y cuotas mensuales."
      resource="/teams"
      exportResource="teams"
      columns={columns}
      fields={fields}
      actionLabel="Nueva Categoría"
      modalDescription="Detalles de la categoría deportiva."
    />
  );
}
