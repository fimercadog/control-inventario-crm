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
import { deleteOwner } from "@/features/owners/api";
import { OWNER_STATUS_CONFIG } from "@/features/owners/status-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { OWNER_STATUS_LABELS, OWNER_STATUSES, type Owner } from "@/types/owner";

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Owner>[] {
  return [
    { accessorKey: "name", header: "Nombre", enableSorting: true },
    { accessorKey: "document", header: "Documento", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    { accessorKey: "phone", header: "Teléfono", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    { accessorKey: "email", header: "Correo", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    { accessorKey: "properties_count", header: "Propiedades" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<Owner["status"]>()} config={OWNER_STATUS_CONFIG} />,
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
                    (table.options.meta as { requestDelete: (row: Owner) => void }).requestDelete(row.original),
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

export function OwnersTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Owner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ status }), [status]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Owner>({ endpoint: "/owners", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteOwner(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" eliminado correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el propietario");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar propietarios..."
        filters={
          <FilterDropdown
            label="Estado"
            value={status}
            onChange={setStatus}
            options={OWNER_STATUSES.map((value) => ({ value, label: OWNER_STATUS_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons
            endpoint="/owners/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="propietarios"
          />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/owners/new">
                <Plus />
                Nuevo propietario
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
        emptyTitle="No hay propietarios"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea un nuevo propietario."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/owners/${id}/edit`),
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
        resourceName={pendingDelete?.name}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
