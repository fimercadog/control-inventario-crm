"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";

type Enrollment = {
  id: number;
  enrollment_number: string;
  student?: { first_name: string; last_name: string; client?: { name: string } };
  team?: { name: string };
  monthly_fee: number;
  enrollment_fee: number;
  billing_day: number;
  start_date: string;
  status: string;
};

const columns: AppColumnDef<Enrollment>[] = [
  { accessorKey: "enrollment_number", header: "N° Inscripción" },
  { header: "Alumno", cell: ({ row }) => row.original.student ? `${row.original.student.first_name} ${row.original.student.last_name}` : "—" },
  { header: "Acudiente", cell: ({ row }) => row.original.student?.client?.name ?? "—" },
  { header: "Categoría", cell: ({ row }) => row.original.team?.name ?? "—" },
  { header: "Mensualidad", cell: ({ row }) => `$${Number(row.original.monthly_fee).toLocaleString("es-CO")}` },
  { header: "Día de Cobro", cell: ({ row }) => `Día ${row.original.billing_day}` },
  { header: "Fecha Inicio", cell: ({ row }) => row.original.start_date },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "student_id", label: "Alumno / Deportista", type: "select", optionsResource: "/students", required: true },
  { name: "team_id", label: "Categoría / Equipo", type: "select", optionsResource: "/teams", required: true },
  { name: "monthly_fee", label: "Cuota Mensual ($)", type: "number", omitWhenEmpty: true },
  { name: "enrollment_fee", label: "Valor de Matrícula ($)", type: "number", omitWhenEmpty: true },
  { name: "billing_day", label: "Día de Cobro del Mes", type: "number", omitWhenEmpty: true },
  { name: "start_date", label: "Fecha de Inicio", type: "date", required: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activa", value: "active" },
      { label: "Pausada", value: "paused" },
      { label: "Cancelada", value: "cancelled" },
    ],
  },
  { name: "notes", label: "Notas / Observaciones", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function EnrollmentsPage() {
  return (
    <ModuleTablePage<Enrollment>
      title="Inscripciones y Cobro de Pensiones"
      description="Registro de matrículas activas y generación automática de cartera en el ERP Core."
      resource="/enrollments"
      exportResource="enrollments"
      columns={columns}
      fields={fields}
      actionLabel="Nueva Inscripción"
      modalDescription="Genera la matrícula y la primera cuenta por cobrar en el sistema."
    />
  );
}
