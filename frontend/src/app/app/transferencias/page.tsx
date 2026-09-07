"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { AppColumnDef, dateColumn } from "@/lib/table-types";
import { StockTransfer } from "@/lib/types";

const columns: AppColumnDef<StockTransfer>[] = [
  dateColumn<StockTransfer>("created_at", "Fecha"),
  { header: "Producto", cell: ({ row }) => row.original.product ?? "—" },
  { header: "Origen", cell: ({ row }) => row.original.from_warehouse ?? "—" },
  { header: "Destino", cell: ({ row }) => row.original.to_warehouse ?? "—" },
  { header: "Cantidad", cell: ({ row }) => row.original.quantity },
  { header: "Referencia", cell: ({ row }) => row.original.reference ?? "—" },
];

const fields: CrudField[] = [
  { name: "product_id", label: "Producto", type: "select", optionsResource: "/products", required: true },
  { name: "from_warehouse_id", label: "Bodega origen", type: "select", optionsResource: "/warehouses", required: true },
  { name: "to_warehouse_id", label: "Bodega destino", type: "select", optionsResource: "/warehouses", required: true },
  { name: "quantity", label: "Cantidad", type: "number", required: true, min: 1 },
  { name: "reference", label: "Referencia", omitWhenEmpty: true },
  { name: "notes", label: "Notas", type: "textarea", colSpan: "full", omitWhenEmpty: true },
];

export default function StockTransfersPage() {
  return (
    <ModuleTablePage<StockTransfer>
      title="Transferencias"
      description="Movimiento de stock de una bodega a otra. Genera una salida y una entrada."
      resource="/stock-transfers"
      columns={columns}
      fields={fields}
      actionLabel="Nueva transferencia"
      modalDescription="Al confirmar se descuenta del origen y se suma al destino."
      editable={false}
    />
  );
}
