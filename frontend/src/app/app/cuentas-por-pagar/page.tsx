"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { AccountPayable } from "@/lib/types";

const STATUS_LABEL: Record<AccountPayable["status"], string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagada",
  overdue: "Vencida",
};

const columns: AppColumnDef<AccountPayable>[] = [
  { header: "Proveedor", cell: ({ row }) => row.original.supplier?.name ?? `#${row.original.supplier_id}` },
  { header: "Recepción", cell: ({ row }) => row.original.purchase_receipt_id ? `#${row.original.purchase_receipt_id}` : "—" },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status]} /> },
  dateColumn<AccountPayable>("due_date", "Vence"),
  { header: "Saldo", cell: ({ row }) => `$${Number(row.original.balance).toLocaleString("es-CO")}` },
];

export default function AccountsPayablePage() {
  return (
    <ModuleTablePage<AccountPayable>
      title="Cuentas por pagar"
      description="Obligaciones con proveedores generadas por recepciones de compra. El saldo se deriva de pagos."
      resource="/accounts-payable"
      exportResource="accounts-payable"
      columns={columns}
      editable={false}
    />
  );
}
