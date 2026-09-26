"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColumnDef } from "@/lib/table-types";
import { Product } from "@/lib/types";

const columns: AppColumnDef<Product>[] = [
  { accessorKey: "name", header: "Artículo / Indumentaria" },
  { accessorKey: "sku", header: "SKU" },
  { header: "Categoría", cell: ({ row }) => row.original.category ?? "General" },
  { header: "Precio de Venta", cell: ({ row }) => `$${Number(row.original.unit_price).toLocaleString("es-CO")}` },
  { header: "Stock Disponible", cell: ({ row }) => `${row.original.stock_on_hand ?? 0} unidades` },
  { header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const fields: CrudField[] = [
  { name: "name", label: "Nombre de la Prenda / Artículo", required: true },
  { name: "sku", label: "SKU / Código", omitWhenEmpty: true },
  { name: "category_id", label: "Categoría", type: "select", optionsResource: "/categories", omitWhenEmpty: true },
  { name: "unit_price", label: "Precio de Venta ($)", type: "number", required: true },
  { name: "cost_price", label: "Costo ($)", type: "number", omitWhenEmpty: true },
  { name: "reorder_level", label: "Nivel de Reorden / Stock Mínimo", type: "number", omitWhenEmpty: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "active" },
      { label: "Inactivo", value: "inactive" },
    ],
  },
  { name: "description", label: "Descripción / Tallas Disponibles", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
];

export default function UniformStorePage() {
  return (
    <ModuleTablePage<Product>
      title="Tienda de Uniformes e Indumentaria"
      description="Gestión de inventario de kits oficiales, balones y accesorios deportivos integrados al ERP Core."
      resource="/products"
      exportResource="products"
      columns={columns}
      fields={fields}
    />
  );
}
