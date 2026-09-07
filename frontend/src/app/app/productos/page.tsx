"use client";

import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Product } from "@/lib/types";

const columns: AppColumnDef<Product>[] = [
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "name", header: "Nombre" },
  { header: "Categoria", cell: ({ row }) => row.original.category ?? "—" },
  { header: "Marca", cell: ({ row }) => row.original.brand ?? "—" },
  { header: "Precio", cell: ({ row }) => `$${Number(row.original.unit_price).toLocaleString("es-CO")}` },
  {
    header: "Existencia",
    cell: ({ row }) => {
      const stock = row.original.stock_on_hand ?? 0;
      const low = stock < row.original.reorder_level;
      return <Badge className={low ? "bg-warning/20 text-warning" : undefined}>{stock}{low ? " (bajo)" : ""}</Badge>;
    },
  },
  { header: "Estado", cell: ({ row }) => <Badge>{row.original.status === "active" ? "Activo" : "Inactivo"}</Badge> },
];

const fields: CrudField[] = [
  { name: "sku", label: "SKU", required: true },
  { name: "name", label: "Nombre", required: true },
  { name: "category_id", label: "Categoria", type: "select", optionsResource: "/categories", omitWhenEmpty: true },
  { name: "brand_id", label: "Marca", type: "select", optionsResource: "/brands", omitWhenEmpty: true },
  { name: "unit_id", label: "Unidad", type: "select", optionsResource: "/units", omitWhenEmpty: true },
  { name: "unit_price", label: "Precio de venta", type: "number", required: true, min: 0, step: 100 },
  { name: "cost_price", label: "Precio de costo", type: "number", required: true, min: 0, step: 100 },
  { name: "reorder_level", label: "Punto de reorden", type: "number", required: true, min: 0 },
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
];

export default function ProductsPage() {
  return (
    <ModuleTablePage<Product>
      title="Productos"
      description="Catalogo de productos con precio y existencia actual."
      resource="/products"
      exportResource="products"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo producto"
      modalDescription="Producto del catalogo de inventario."
    />
  );
}
