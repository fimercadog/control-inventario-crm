"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Patient } from "@/lib/types";

const SEX_LABEL: Record<string, string> = { male: "Masculino", female: "Femenino", unknown: "Otro / No especifica" };

const columns: AppColumnDef<Patient & Record<string, any>>[] = [
  {
    header: "Nombre del Paciente",
    cell: ({ row }) => {
      const p = row.original;
      const fullName = p.first_name ? `${p.first_name} ${p.last_name || ""}` : p.name;
      return (
        <Link href={`/app/pacientes/${p.id}`} className="font-bold text-blue-600 hover:underline">
          {fullName}
        </Link>
      );
    },
  },
  {
    header: "Documento",
    cell: ({ row }) => {
      const p = row.original;
      return p.document_number ? `${p.document_type || "CC"} ${p.document_number}` : "—";
    },
  },
  { header: "Teléfono", cell: ({ row }) => row.original.phone || "—" },
  { header: "Dirección", cell: ({ row }) => [row.original.address, row.original.city].filter(Boolean).join(", ") || "—" },
  { header: "EPS / Aseguradora", cell: ({ row }) => row.original.health_coverage_provider || "Particular" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "first_name", label: "Nombres", required: true },
  { name: "last_name", label: "Apellidos", required: true },
  { name: "name", label: "Nombre Completo / Identificador", required: true },
  {
    name: "document_type",
    label: "Tipo de Documento",
    type: "select",
    required: true,
    options: [
      { label: "Cédula de Ciudadanía (CC)", value: "CC" },
      { label: "Cédula de Extranjería (CE)", value: "CE" },
      { label: "Pasaporte", value: "PASAPORTE" },
      { label: "Tarjeta de Identidad (TI)", value: "TI" },
    ],
  },
  { name: "document_number", label: "Número de Documento", required: true },
  {
    name: "sex",
    label: "Sexo / Género",
    type: "select",
    required: true,
    options: [
      { label: "Femenino", value: "female" },
      { label: "Masculino", value: "male" },
      { label: "Otro / No especifica", value: "unknown" },
    ],
  },
  { name: "birth_date", label: "Fecha de Nacimiento", type: "date", omitWhenEmpty: true },
  { name: "phone", label: "Teléfono de Contacto", omitWhenEmpty: true },
  { name: "address", label: "Dirección Domiciliaria", omitWhenEmpty: true },
  { name: "city", label: "Ciudad", omitWhenEmpty: true },
  { name: "health_coverage_provider", label: "EPS / Entidad Aseguradora", omitWhenEmpty: true },
  { name: "emergency_contact_name", label: "Contacto de Emergencia (Nombre)", omitWhenEmpty: true },
  { name: "emergency_contact_phone", label: "Contacto de Emergencia (Teléfono)", omitWhenEmpty: true },
  { name: "medical_history_summary", label: "Resumen de Antecedentes Médicos", omitWhenEmpty: true },
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
      title="Pacientes de Atención Domiciliaria"
      description="Directorio de pacientes asistenciales para enfermería y seguimiento clínico."
      resource="/patients"
      columns={columns as any}
      fields={fields}
      actionLabel="Registrar Paciente"
      modalDescription="Ingrese los datos del paciente para atención asistencial."
    />
  );
}
