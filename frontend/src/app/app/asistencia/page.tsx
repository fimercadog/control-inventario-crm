"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";

type Attendance = {
  id: number;
  date: string;
  student?: { first_name: string; last_name: string };
  team?: { name: string };
  status: string;
  notes?: string;
};

const columns: AppColumnDef<Attendance>[] = [
  { accessorKey: "date", header: "Fecha" },
  { header: "Alumno", cell: ({ row }) => row.original.student ? `${row.original.student.first_name} ${row.original.student.last_name}` : "—" },
  { header: "Categoría", cell: ({ row }) => row.original.team?.name ?? "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { header: "Observación", cell: ({ row }) => row.original.notes ?? "—" },
];

const fields: CrudField[] = [
  { name: "team_id", label: "Categoría / Equipo", type: "select", optionsResource: "/teams", required: true },
  { name: "student_id", label: "Alumno", type: "select", optionsResource: "/students", required: true },
  { name: "date", label: "Fecha de Práctica", type: "date", required: true },
  {
    name: "status",
    label: "Estado de Asistencia",
    type: "select",
    required: true,
    options: [
      { label: "Presente", value: "present" },
      { label: "Ausente", value: "absent" },
      { label: "Excusa Médica", value: "excused" },
      { label: "Retardo", value: "late" },
    ],
  },
  { name: "notes", label: "Observación", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function AttendancePage() {
  return (
    <ModuleTablePage<Attendance>
      title="Control de Asistencia"
      description="Registro diario de asistencia a entrenamientos por categoría y fecha."
      resource="/attendances"
      exportResource="attendances"
      columns={columns}
      fields={fields}
      actionLabel="Registrar Asistencia"
      modalDescription="Detalle de asistencia del deportista a la sesión de práctica."
    />
  );
}
