"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { deleteProperty } from "@/features/properties/api";
import { PROPERTY_STATUS_CONFIG } from "@/features/properties/status-config";
import { useContingency } from "@/features/contingency/contingency-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import {
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUSES,
  type Property,
} from "@/types/property";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Property>[] {
  return [
    { accessorKey: "code", header: "Código" },
    { accessorKey: "title", header: "Propiedad", enableSorting: true },
    { accessorKey: "city", header: "Ciudad", enableSorting: true },
    {
      id: "owner",
      header: "Propietario",
      cell: ({ row }) => row.original.owner?.name ?? "—",
    },
    {
      accessorKey: "price",
      header: "Precio",
      enableSorting: true,
      cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<Property["status"]>()} config={PROPERTY_STATUS_CONFIG} />,
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
                    (table.options.meta as { requestDelete: (row: Property) => void }).requestDelete(row.original),
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

export function PropertiesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") ?? undefined;
  const { canWrite: roleCanWrite, canDelete: roleCanDelete } = usePermissions();
  const { isActive } = useContingency();
  // Properties isn't a contingency-eligible module: while contingency mode
  // is active, it's always forced into read-only regardless of role.
  const contingencyBlocksWrites = isActive;
  const canWrite = roleCanWrite && !contingencyBlocksWrites;
  const canDelete = roleCanDelete && !contingencyBlocksWrites;

  const [status, setStatus] = useState<string | undefined>(statusFromUrl);
  const [listingType, setListingType] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ status, listing_type: listingType }), [status, listingType]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);

  const table = useServerTable<Property>({ endpoint: "/properties", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteProperty(pendingDelete.id);
      toast.success(`"${pendingDelete.title}" eliminada correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar la propiedad");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar propiedades..."
        filters={
          <>
            <FilterDropdown
              label="Estado"
              value={status}
              onChange={setStatus}
              options={PROPERTY_STATUSES.map((value) => ({ value, label: PROPERTY_STATUS_LABELS[value] }))}
            />
            <FilterDropdown
              label="Venta/Arriendo"
              value={listingType}
              onChange={setListingType}
              options={LISTING_TYPES.map((value) => ({ value, label: LISTING_TYPE_LABELS[value] }))}
            />
          </>
        }
        exportSlot={
          <ExportButtons
            endpoint="/properties/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="propiedades"
          />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/properties/new">
                <Plus />
                Nueva propiedad
              </Link>
            </Button>
          ) : undefined
        }
      />

      {contingencyBlocksWrites && roleCanWrite && (
        <p className="text-sm text-muted-foreground">Solo lectura durante modo contingencia.</p>
      )}

      <DataTable
        columns={columns}
        data={table.items}
        isLoading={table.isLoading}
        error={table.error}
        onRetry={table.refetch}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        emptyTitle="No hay propiedades"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea una nueva propiedad."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/properties/${id}/edit`),
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
        resourceName={pendingDelete?.title}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
