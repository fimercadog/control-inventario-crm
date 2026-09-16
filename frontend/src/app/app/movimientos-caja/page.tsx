"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { CashMovement } from "@/lib/types";

const columns: AppColumnDef<CashMovement>[] = [
  { header: "Sesión", cell: ({ row }) => `#${row.original.cash_session_id}` },
  { header: "Tipo", cell: ({ row }) => <Badge>{row.original.type === "in" ? "Entrada" : "Salida"}</Badge> },
  { header: "Método", accessorKey: "method" },
  { header: "Referencia", cell: ({ row }) => row.original.reference ?? "—" },
  { header: "Valor", cell: ({ row }) => `$${Number(row.original.amount).toLocaleString("es-CO")}` },
  dateColumn<CashMovement>("created_at", "Fecha"),
];

export default function CashMovementsPage() {
  return (
    <ModuleTablePage<CashMovement>
      title="Movimientos de caja"
      description="Bitácora histórica de entradas y salidas generadas por pagos."
      resource="/cash-movements"
      exportResource="cash-movements"
      columns={columns}
      editable={false}
    />
  );
}
