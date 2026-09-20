"use client";

import { AppointmentStatusAction } from "@/components/crud/appointment-status-action";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABEL as STATUS_LABEL } from "@/lib/appointments";
import { AppColumnDef } from "@/lib/table-types";
import { Appointment } from "@/lib/types";

function whenLabel(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

const columns: AppColumnDef<Appointment>[] = [
  { header: "Fecha y hora", cell: ({ row }) => whenLabel(row.original.starts_at) },
  { header: "Paciente", cell: ({ row }) => row.original.patient ?? "—" },
  { header: "Cliente / Titular", cell: ({ row }) => row.original.client ?? "—" },
  { header: "Servicio", cell: ({ row }) => row.original.service ?? "—" },
  { header: "Especialista / Médico", cell: ({ row }) => row.original.practitioner ?? "—" },
  { header: "Cabina / Box", cell: ({ row }) => row.original.resource ?? "—" },
  { header: "Estado", cell: ({ row }) => <Badge>{STATUS_LABEL[row.original.status] ?? row.original.status}</Badge> },
];

const fields: CrudField[] = [
  { name: "patient_id", label: "Paciente", type: "select", optionsResource: "/patients", required: true },
  { name: "service_id", label: "Servicio / Tratamiento", type: "select", optionsResource: "/services", omitWhenEmpty: true },
  { name: "practitioner_id", label: "Especialista / Médico", type: "select", optionsResource: "/users", omitWhenEmpty: true },
  { name: "starts_at", label: "Inicio", type: "text", required: true, pattern: "\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}" },
  { name: "ends_at", label: "Fin", type: "text", required: true, pattern: "\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}" },
  { name: "resource", label: "Cabina / consultorio", omitWhenEmpty: true },
  { name: "reason", label: "Motivo de la valoración", omitWhenEmpty: true },
  { name: "notes", label: "Notas médicas / administrativas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function AppointmentsPage() {
  return (
    <ModuleTablePage<Appointment>
      title="Citas & Valoraciones"
      description="Todas las citas de la clínica. Filtrá por estado, especialista o fecha."
      resource="/appointments"
      columns={columns}
      fields={fields}
      actionLabel="Nueva cita"
      modalDescription="Fecha en formato AAAA-MM-DD HH:MM. El cliente/titular se deriva del paciente."
      extraRowActions={(row, refresh) => <AppointmentStatusAction appointment={row} onDone={refresh} />}
    />
  );
}
