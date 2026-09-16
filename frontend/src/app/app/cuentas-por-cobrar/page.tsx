"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { AccountReceivable } from "@/lib/types";

const STATUS_LABEL: Record<AccountReceivable["status"], string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagada",
  overdue: "Vencida",
};

const columns: AppColumnDef<AccountReceivable>[] = [
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? `#${row.original.client_id}` },
  { header: "Factura", cell: ({ row }) => row.original.invoice ?? `#${row.original.invoice_id}` },
  { header: "Estado", cell: ({ row }) => <Badge>{STATUS_LABEL[row.original.status]}</Badge> },
  dateColumn<AccountReceivable>("due_date", "Vence"),
  { header: "Saldo", cell: ({ row }) => `$${Number(row.original.balance).toLocaleString("es-CO")}` },
];

export default function AccountsReceivablePage() {
  return (
    <ModuleTablePage<AccountReceivable>
      title="Cuentas por cobrar"
      description="Cartera de clientes generada por facturas emitidas. El saldo se deriva de pagos."
      resource="/accounts-receivable"
      exportResource="accounts-receivable"
      columns={columns}
      editable={false}
    />
  );
}
