"use client";

import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { Invoice } from "@/lib/types";

const STATUS_LABEL: Record<Invoice["status"], string> = {
  draft: "Borrador",
  issued: "Emitida",
  partially_paid: "Parcialmente pagada",
  paid: "Pagada",
  void: "Anulada",
};

const columns: AppColumnDef<Invoice>[] = [
  {
    header: "Número",
    cell: ({ row }) => (
      <Link href={`/app/facturas/${row.original.id}`} className="font-semibold text-primary hover:underline">
        {row.original.number}
      </Link>
    ),
  },
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? `#${row.original.client_id}` },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status]} /> },
  dateColumn<Invoice>("due_date", "Vence"),
  { header: "Total", cell: ({ row }) => `$${Number(row.original.total).toLocaleString("es-CO")}` },
];

const fields: CrudField[] = [
  { name: "client_id", label: "Cliente", type: "select", required: true, optionsResource: "/clients" },
  { name: "order_id", label: "ID pedido", type: "number", min: 1, omitWhenEmpty: true, hint: "Opcional. Si se informa, toma las líneas del pedido." },
  { name: "warehouse_id", label: "Bodega", type: "select", optionsResource: "/warehouses", omitWhenEmpty: true },
  { name: "due_date", label: "Vencimiento", type: "date", omitWhenEmpty: true },
  { name: "notes", label: "Observaciones", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function InvoicesPage() {
  return (
    <ModuleTablePage<Invoice>
      title="Facturas internas"
      description="Facturación administrativa interna. No corresponde a facturación electrónica DIAN."
      resource="/invoices"
      exportResource="invoices"
      columns={columns}
      fields={fields}
      actionLabel="Nueva factura"
      modalDescription="Para facturas con líneas manuales usa el API avanzado; desde pedido se copian productos y snapshots."
    />
  );
}
