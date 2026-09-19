"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { ExportButtons } from "@/components/shared/export-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteVisit } from "@/features/visits/api";
import { VISIT_STATUS_CONFIG } from "@/features/visits/status-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { VISIT_STATUS_LABELS, VISIT_STATUSES, type Visit } from "@/types/visit";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Visit>[] {
  return [
    { id: "property", header: "Propiedad", cell: ({ row }) => row.original.property?.title ?? "—" },
    { id: "client", header: "Cliente", cell: ({ row }) => row.original.client?.name ?? "—" },
    {
      accessorKey: "scheduled_at",
      header: "Fecha y hora",
      enableSorting: true,
      cell: ({ getValue }) => dateFormatter.format(new Date(getValue<string>())),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<Visit["status"]>()} config={VISIT_STATUS_CONFIG} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const items: ActionMenuItem[] = [
          ...(canWrite
            ? [
                {
                  label: "Editar",
                  icon: Pencil,
                  onSelect: () =>
                    (table.options.meta as { navigateToEdit: (id: number) => void }).navigateToEdit(
                      row.original.id,
                    ),
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  label: "Eliminar",
                  icon: Trash2,
                  variant: "destructive" as const,
                  separatorBefore: canWrite,
                  onSelect: () =>
                    (table.options.meta as { requestDelete: (row: Visit) => void }).requestDelete(row.original),
                },
              ]
            : []),
        ];

        if (items.length === 0) return <div />;

        return (
          <div className="flex justify-end">
            <ActionMenu items={items} />
          </div>
        );
      },
    },
  ];
}

export function VisitsTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ status }), [status]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Visit>({ endpoint: "/visits", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteVisit(pendingDelete.id);
      toast.success("Visita eliminada correctamente");
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar la visita");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar visitas..."
        filters={
          <FilterDropdown
            label="Estado"
            value={status}
            onChange={setStatus}
            options={VISIT_STATUSES.map((value) => ({ value, label: VISIT_STATUS_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons
            endpoint="/visits/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="visitas"
          />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/visits/new">
                <Plus />
                Nueva visita
              </Link>
            </Button>
          ) : undefined
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
        emptyTitle="No hay visitas"
        emptyDescription="Ajusta la búsqueda o los filtros, o agenda una nueva visita."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/visits/${id}/edit`),
        }}
      />

      <DataTablePagination
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        total={table.total}
        lastPage={table.lastPage}
        onPageIndexChange={table.setPageIndex}
        onPageSizeChange={table.setPageSize}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
