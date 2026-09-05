"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Badge } from "@/components/ui/badge";
import { AppColumnDef } from "@/lib/table-types";
import { Order } from "@/lib/types";

const STATUS_LABEL: Record<Order["status"], string> = { draft: "Borrador", confirmed: "Confirmado", cancelled: "Cancelado" };

const columns: AppColumnDef<Order>[] = [
  { header: "Cliente", cell: ({ row }) => row.original.client?.name ?? `#${row.original.client_id}` },
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.name ?? `#${row.original.warehouse_id}` },
  { header: "Estado", cell: ({ row }) => <Badge>{STATUS_LABEL[row.original.status]}</Badge> },
  { header: "Total", cell: ({ row }) => `$${Number(row.original.total).toLocaleString("es-CO")}` },
];

const fields: CrudField[] = [
  { name: "client_id", label: "ID cliente", type: "number", required: true, min: 1, hint: "ID de un cliente existente" },
  { name: "deal_id", label: "ID deal", type: "number", min: 1, omitWhenEmpty: true, hint: "Opcional, si nace de un deal ganado" },
  { name: "warehouse_id", label: "ID bodega", type: "number", required: true, min: 1, hint: "Bodega desde la que se despacha" },
];

export default function OrdersPage() {
  return (
    <ModuleTablePage<Order>
      title="Pedidos"
      description="Ventas a clientes. Al confirmarse descuentan stock de la bodega elegida."
      resource="/orders"
      exportResource="orders"
      columns={columns}
      fields={fields}
      actionLabel="Nuevo pedido"
      modalDescription="Cabecera del pedido. Las lineas se agregan en el detalle."
      extraRowActions={(row) => (
        <Link href={`/app/pedidos/${row.id}`} className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
          <Eye className="h-4 w-4" /> Ver
        </Link>
      )}
    />
  );
}
