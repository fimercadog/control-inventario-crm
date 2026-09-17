"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Patient } from "@/lib/types";

const SEX_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
  unknown: "Sin dato",
};

const columns: AppColumnDef<Patient>[] = [
  {
    header: "Documento",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        {row.original.document_number
          ? `${row.original.document_type || "CC"} ${row.original.document_number}`
          : "—"}
      </span>
    ),
  },
  {
    header: "Paciente",
    cell: ({ row }) => (
      <Link href={`/app/pacientes/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { header: "EPS / Aseguradora", cell: ({ row }) => row.original.eps || "—" },
  { header: "Grupo RH", cell: ({ row }) => row.original.blood_type || "—" },
  { header: "Teléfono", cell: ({ row }) => row.original.phone || "—" },
  { header: "Sexo", cell: ({ row }) => SEX_LABEL[row.original.sex] ?? row.original.sex },
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.status === "active" ? "Activo" : "Inactivo"}</Badge> },
];

const fields: CrudField[] = [
  {
    name: "document_type",
    label: "Tipo de documento",
    type: "select",
    options: [
      { label: "Cédula de Ciudadanía (CC)", value: "CC" },
      { label: "Cédula de Extranjería (CE)", value: "CE" },
      { label: "Tarjeta de Identidad (TI)", value: "TI" },
      { label: "Pasaporte (PA)", value: "PA" },
      { label: "Registro Civil (RC)", value: "RC" },
      { label: "Permiso Especial (PEP)", value: "PEP" },
      { label: "NIT", value: "NIT" },
    ],
    omitWhenEmpty: true,
  },
  { name: "document_number", label: "Número de documento", omitWhenEmpty: true },
  { name: "name", label: "Nombre completo del paciente", required: true },
  {
    name: "sex",
    label: "Sexo / Género",
    type: "select",
    required: true,
    options: [
      { label: "Masculino", value: "male" },
      { label: "Femenino", value: "female" },
      { label: "Otro", value: "other" },
      { label: "Sin dato", value: "unknown" },
    ],
  },
  { name: "birth_date", label: "Fecha de nacimiento", type: "date", omitWhenEmpty: true },
  {
    name: "blood_type",
    label: "Grupo Sanguíneo / RH",
    type: "select",
    options: [
      { label: "O+", value: "O+" },
      { label: "O-", value: "O-" },
      { label: "A+", value: "A+" },
      { label: "A-", value: "A-" },
      { label: "B+", value: "B+" },
      { label: "B-", value: "B-" },
      { label: "AB+", value: "AB+" },
      { label: "AB-", value: "AB-" },
    ],
    omitWhenEmpty: true,
  },
  { name: "eps", label: "EPS / Entidad de Salud", omitWhenEmpty: true },
  { name: "phone", label: "Teléfono de contacto", omitWhenEmpty: true },
  { name: "email", label: "Correo electrónico", omitWhenEmpty: true },
  { name: "address", label: "Dirección de residencia", omitWhenEmpty: true },
  { name: "emergency_contact_name", label: "Contacto de emergencia (Nombre)", omitWhenEmpty: true },
  { name: "emergency_contact_phone", label: "Contacto de emergencia (Teléfono)", omitWhenEmpty: true },
  { name: "client_id", label: "Titular / Responsable (Opcional)", type: "select", optionsResource: "/clients", omitWhenEmpty: true },
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
      title="Directorio de Pacientes IPS"
      description="Historias clínicas e información asistencial de pacientes humanos."
      resource="/patients"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo paciente"
      modalDescription="Registro completo del paciente humano en la IPS."
    />
  );
}
