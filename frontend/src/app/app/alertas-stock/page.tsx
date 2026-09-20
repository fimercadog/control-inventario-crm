"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Product } from "@/lib/types";

function stockBadge(product: Product) {
  const stock = product.stock_on_hand ?? 0;
  if (stock <= 0) return <StatusBadge status="destructive" label="Agotado" />;
  if (stock < product.reorder_level) return <StatusBadge status="warning" label="Bajo" />;
  return <StatusBadge status="info" label="Sobrestock" />;
}

const columns: AppColumnDef<Product>[] = [
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "name", header: "Nombre" },
  { header: "Categoria", cell: ({ row }) => row.original.category ?? "—" },
  { header: "Existencia", cell: ({ row }) => row.original.stock_on_hand ?? 0 },
  { header: "Punto de reorden", cell: ({ row }) => row.original.reorder_level },
  { header: "Estado", cell: ({ row }) => stockBadge(row.original) },
];

export default function StockAlertsPage() {
  return (
    <ModuleTablePage<Product>
      title="Alertas de stock"
      description="Productos agotados o por debajo de su punto de reorden."
      resource="/stock-alerts"
      columns={columns}
    />
  );
}
