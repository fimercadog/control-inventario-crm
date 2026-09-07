"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Product } from "@/lib/types";

function stockBadge(product: Product) {
  const stock = product.stock_on_hand ?? 0;
  if (stock <= 0) return <Badge className="bg-destructive/15 text-destructive">Agotado</Badge>;
  if (stock < product.reorder_level) return <Badge className="bg-warning/20 text-warning">Bajo</Badge>;
  return <Badge className="bg-primary/15 text-primary">Sobrestock</Badge>;
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
