"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { Payment } from "@/lib/types";

const columns: AppColumnDef<Payment>[] = [
  { header: "Tipo", cell: ({ row }) => <Badge>{row.original.direction === "in" ? "Cobro" : "Pago"}</Badge> },
  { header: "Documento", cell: ({ row }) => `${row.original.target_type === "receivable" ? "CxC" : "CxP"} #${row.original.target_id}` },
  dateColumn<Payment>("paid_at", "Fecha"),
  { header: "Método", accessorKey: "method" },
  { header: "Valor", cell: ({ row }) => `$${Number(row.original.amount).toLocaleString("es-CO")}` },
];

const fields: CrudField[] = [
  { name: "target_type", label: "Aplicar a", type: "select", required: true, options: [{ label: "Cuenta por cobrar", value: "receivable" }, { label: "Cuenta por pagar", value: "payable" }] },
  { name: "target_id", label: "ID documento", type: "number", required: true, min: 1 },
  { name: "amount", label: "Valor", type: "number", required: true, min: 0.01, step: 0.01 },
  { name: "paid_at", label: "Fecha", type: "date", omitWhenEmpty: true },
  { name: "method", label: "Método", type: "select", options: [{ label: "Efectivo", value: "cash" }, { label: "Transferencia", value: "transfer" }, { label: "Tarjeta", value: "card" }], omitWhenEmpty: true },
  { name: "cash_session_id", label: "ID sesión de caja", type: "number", min: 1, omitWhenEmpty: true },
  { name: "reference", label: "Referencia", omitWhenEmpty: true },
  { name: "notes", label: "Observaciones", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function PaymentsPage() {
  return (
    <ModuleTablePage<Payment>
      title="Pagos y abonos"
      description="Cobros a clientes y pagos a proveedores, con saldos derivados e integración opcional a caja."
      resource="/payments"
      exportResource="payments"
      columns={columns}
      fields={fields}
      actionLabel="Registrar pago"
      editable={false}
    />
  );
}
