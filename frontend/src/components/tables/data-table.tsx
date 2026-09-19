"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";

export type DataTableColumnDef<TData extends RowData> = ColumnDef<TData>;

interface DataTableProps<T extends RowData> {
  columns: DataTableColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  getRowId?: (row: T) => string;
  meta?: Record<string, unknown>;
}

export function DataTable<T extends RowData>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "Sin resultados",
  emptyDescription = "No se encontraron registros con los criterios actuales.",
  sorting,
  onSortingChange,
  getRowId,
  meta,
}: DataTableProps<T>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    state: sorting ? { sorting } : undefined,
    onSortingChange: onSortingChange
      ? (updater) => {
          const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
          onSortingChange(next);
        }
      : undefined,
    manualSorting: true,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    meta,
  });

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (isLoading && data.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1 hover:text-foreground",
                            isSorted && "font-semibold text-foreground",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSorted === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : isSorted === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
