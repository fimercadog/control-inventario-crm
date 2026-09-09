"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { ClinicalApplication } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = { vaccine: "Vacuna", deworming: "Desparasitación" };

const columns: AppColumnDef<ClinicalApplication>[] = [
  { header: "Fecha", cell: ({ row }) => formatDate(row.original.applied_at) },
  {
    header: "Paciente",
    cell: ({ row }) => (
      <Link href={`/app/pacientes/${row.original.patient_id}`} className="text-primary hover:underline">
        {row.original.patient ?? "—"}
      </Link>
    ),
  },
  { header: "Tipo", cell: ({ row }) => <Badge>{TYPE_LABEL[row.original.type] ?? row.original.type}</Badge> },
  { header: "Nombre", cell: ({ row }) => row.original.name },
  { header: "Lote", cell: ({ row }) => row.original.lot ?? "—" },
  { header: "Próxima dosis", cell: ({ row }) => (row.original.next_due_at ? formatDate(row.original.next_due_at) : "—") },
  { header: "Stock", cell: ({ row }) => (row.original.stock_movement_id ? "Descontado" : "—") },
];

const fields: CrudField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { label: "Vacuna", value: "vaccine" },
      { label: "Desparasitación", value: "deworming" },
    ],
  },
  { name: "patient_id", label: "Paciente", type: "select", optionsResource: "/patients", required: true },
  { name: "name", label: "Nombre / producto aplicado", required: true },
  { name: "applied_at", label: "Fecha de aplicación", type: "date", required: true },
  { name: "lot", label: "Lote", omitWhenEmpty: true },
  { name: "expires_at", label: "Vencimiento del lote", type: "date", omitWhenEmpty: true },
  { name: "next_due_at", label: "Próxima dosis", type: "date", omitWhenEmpty: true },
  {
    name: "product_id",
    label: "Producto del inventario (descuenta stock)",
    type: "select",
    optionsResource: "/products",
    omitWhenEmpty: true,
  },
  { name: "warehouse_id", label: "Bodega (si aplica producto)", type: "select", optionsResource: "/warehouses", omitWhenEmpty: true },
];

export default function VaccinationsPage() {
  return (
    <ModuleTablePage<ClinicalApplication>
      title="Vacunas y desparasitación"
      description="Aplicaciones registradas en la historia del paciente. Con lote y próxima dosis."
      resource="/clinical-applications"
      columns={columns}
      fields={fields}
      actionLabel="Registrar aplicación"
      modalDescription="Si elegís un producto del inventario, se descuenta el stock de la bodega."
    />
  );
}
