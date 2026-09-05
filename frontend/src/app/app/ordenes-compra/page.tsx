"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { dateColumn, AppColumnDef } from "@/lib/table-types";
import { PurchaseOrder } from "@/lib/types";

const STATUS_LABEL: Record<PurchaseOrder["status"], string> = {
  draft: "Borrador",
  ordered: "Ordenada",
  received: "Recibida",
  cancelled: "Cancelada",
};

const columns: AppColumnDef<PurchaseOrder>[] = [
  { header: "Proveedor", cell: ({ row }) => row.original.supplier?.name ?? `#${row.original.supplier_id}` },
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.name ?? `#${row.original.warehouse_id}` },
  { header: "Estado", cell: ({ row }) => <Badge>{STATUS_LABEL[row.original.status]}</Badge> },
  dateColumn<PurchaseOrder>("expected_date", "Fecha esperada"),
  { header: "Total", cell: ({ row }) => `$${Number(row.original.total).toLocaleString("es-CO")}` },
];

const fields: CrudField[] = [
  { name: "supplier_id", label: "ID proveedor", type: "number", required: true, min: 1, hint: "ID de un proveedor existente" },
  { name: "warehouse_id", label: "ID bodega", type: "number", required: true, min: 1, hint: "Bodega que recibira la mercancia" },
  { name: "order_date", label: "Fecha de orden", type: "date", omitWhenEmpty: true },
  { name: "expected_date", label: "Fecha esperada", type: "date", omitWhenEmpty: true },
];

export default function PurchaseOrdersPage() {
  return (
    <ModuleTablePage<PurchaseOrder>
      title="Ordenes de compra"
      description="Reposicion de inventario. Al recibirse generan entradas de stock."
      resource="/purchase-orders"
      exportResource="purchase-orders"
      columns={columns}
      fields={fields}
      actionLabel="Nueva orden"
      modalDescription="Cabecera de la orden. Las lineas se agregan en el detalle."
      extraRowActions={(row) => (
        <Link href={`/app/ordenes-compra/${row.id}`} className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
          <Eye className="h-4 w-4" /> Ver
        </Link>
      )}
    />
  );
}
