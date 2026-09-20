"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Patient } from "@/lib/types";

const SEX_LABEL: Record<string, string> = { male: "Masculino", female: "Femenino", unknown: "Sin dato" };

const columns: AppColumnDef<Patient>[] = [
  {
    header: "Nombre",
    cell: ({ row }) => (
      <Link href={`/app/pacientes/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { header: "Cliente / Titular", cell: ({ row }) => row.original.client ?? "—" },
  { header: "Zona / Tratamiento", cell: ({ row }) => [row.original.species, row.original.breed].filter(Boolean).join(" · ") || "—" },
  { header: "Sexo", cell: ({ row }) => SEX_LABEL[row.original.sex] ?? row.original.sex },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "client_id", label: "Cliente / Titular", type: "select", optionsResource: "/clients", required: true },
  { name: "name", label: "Nombre", required: true },
  { name: "species_id", label: "Zona principal", type: "select", optionsResource: "/species", required: true },
  { name: "breed_id", label: "Especialidad / Subzona", type: "select", optionsResource: "/breeds", omitWhenEmpty: true },
  {
    name: "sex",
    label: "Sexo",
    type: "select",
    required: true,
    options: [
      { label: "Masculino", value: "male" },
      { label: "Femenino", value: "female" },
      { label: "Sin dato", value: "unknown" },
    ],
  },
  { name: "birth_date", label: "Fecha de nacimiento", type: "date", omitWhenEmpty: true },
  { name: "weight", label: "Peso (kg)", type: "number", step: 0.01, min: 0, omitWhenEmpty: true },
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
      title="Pacientes Estéticos"
      description="Pacientes registrados para consultas, valoraciones y procedimientos médicos estéticos."
      resource="/patients"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo paciente"
      modalDescription="El cliente/titular asignado es el usuario registrado en el sistema."
    />
  );
}
