"use client";

import { AppointmentStatusAction } from "@/components/crud/appointment-status-action";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { APPOINTMENT_STATUS_LABEL as STATUS_LABEL } from "@/lib/appointments";
import { AppColumnDef } from "@/lib/table-types";
import { Appointment } from "@/lib/types";

function whenLabel(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

const columns: AppColumnDef<Appointment>[] = [
  { header: "Fecha y hora", cell: ({ row }) => whenLabel(row.original.starts_at) },
  { header: "Paciente", cell: ({ row }) => row.original.patient ?? "—" },
  { header: "Titular / Contacto", cell: ({ row }) => row.original.client ?? "—" },
  { header: "Servicio / Consulta", cell: ({ row }) => row.original.service ?? "—" },
  { header: "Médico / Especialista", cell: ({ row }) => row.original.practitioner ?? "—" },
  { header: "Consultorio / Sala", cell: ({ row }) => row.original.resource ?? "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status] ?? row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "patient_id", label: "Paciente", type: "select", optionsResource: "/patients", required: true },
  { name: "service_id", label: "Servicio / Consulta", type: "select", optionsResource: "/services", omitWhenEmpty: true },
  { name: "practitioner_id", label: "Médico / Especialista", type: "select", optionsResource: "/users", omitWhenEmpty: true },
  { name: "starts_at", label: "Inicio", type: "text", required: true, pattern: "\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}" },
  { name: "ends_at", label: "Fin", type: "text", required: true, pattern: "\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}" },
  { name: "resource", label: "Consultorio / Sala de atención", omitWhenEmpty: true },
  { name: "reason", label: "Motivo de la cita", omitWhenEmpty: true },
  { name: "notes", label: "Notas asistenciales", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function AppointmentsPage() {
  return (
    <ModuleTablePage<Appointment>
      title="Agenda & Citas Médicas IPS"
      description="Programación de citas médicas de la IPS. Filtrá por estado, médico especialista o fecha."
      resource="/appointments"
      columns={columns}
      fields={fields}
      actionLabel="Nueva cita"
      modalDescription="Fecha en formato AAAA-MM-DD HH:MM. El titular o responsable proviene del paciente."
      extraRowActions={(row, refresh) => <AppointmentStatusAction appointment={row} onDone={refresh} />}
    />
  );
}
