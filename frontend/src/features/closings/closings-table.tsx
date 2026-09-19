"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { ExportButtons } from "@/components/shared/export-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { OPPORTUNITY_STATUS_CONFIG } from "@/features/opportunities/status-config";
import { useServerTable } from "@/hooks/use-server-table";
import type { Opportunity } from "@/types/opportunity";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

const CLOSED_STATUS_OPTIONS = [
  { value: "ganada", label: "Ganada" },
  { value: "perdida", label: "Perdida" },
];

const columns: DataTableColumnDef<Opportunity>[] = [
  { id: "client", header: "Cliente", cell: ({ row }) => row.original.client?.name ?? "—" },
  { id: "property", header: "Propiedad", cell: ({ row }) => row.original.property?.title ?? "—" },
  { id: "agent", header: "Agente", cell: ({ row }) => row.original.agent?.name ?? "—" },
  {
    accessorKey: "value",
    header: "Valor",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return value !== null ? currencyFormatter.format(value) : "—";
    },
  },
  {
    accessorKey: "status",
    header: "Resultado",
    cell: ({ getValue }) => <StatusBadge status={getValue<Opportunity["status"]>()} config={OPPORTUNITY_STATUS_CONFIG} />,
  },
  {
    accessorKey: "closed_at",
    header: "Fecha de cierre",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return value ? dateFormatter.format(new Date(value)) : "—";
    },
  },
];

export function ClosingsTable() {
  const [status, setStatus] = useState<string | undefined>(undefined);

  const filters = useMemo(() => ({ status }), [status]);
  const table = useServerTable<Opportunity>({ endpoint: "/opportunities/closed", filters });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar cierres..."
        filters={<FilterDropdown label="Resultado" value={status} onChange={setStatus} options={CLOSED_STATUS_OPTIONS} />}
        exportSlot={
          <ExportButtons
            endpoint="/opportunities/closed/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="cierres"
          />
        }
      />

      <DataTable
        columns={columns}
        data={table.items}
        isLoading={table.isLoading}
        error={table.error}
        onRetry={table.refetch}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        emptyTitle="No hay cierres registrados"
        emptyDescription="Los negocios ganados o perdidos aparecerán aquí."
        getRowId={(row) => String(row.id)}
      />

      <DataTablePagination
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        total={table.total}
        lastPage={table.lastPage}
        onPageIndexChange={table.setPageIndex}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  );
}
