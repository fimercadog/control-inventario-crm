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
import { deleteOpportunity } from "@/features/opportunities/api";
import { OPPORTUNITY_STAGE_CONFIG, OPPORTUNITY_STATUS_CONFIG } from "@/features/opportunities/status-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGES, type Opportunity } from "@/types/opportunity";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Opportunity>[] {
  return [
    { id: "client", header: "Cliente", cell: ({ row }) => row.original.client?.name ?? "—" },
    { id: "property", header: "Propiedad", cell: ({ row }) => row.original.property?.title ?? "—" },
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
      accessorKey: "stage",
      header: "Etapa",
      cell: ({ getValue }) => (
        <StatusBadge status={getValue<Opportunity["stage"]>()} config={OPPORTUNITY_STAGE_CONFIG} />
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => (
        <StatusBadge status={getValue<Opportunity["status"]>()} config={OPPORTUNITY_STATUS_CONFIG} />
      ),
    },
    {
      accessorKey: "probability",
      header: "Prob.",
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return value !== null ? `${value}%` : "—";
      },
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
                    (table.options.meta as { requestDelete: (row: Opportunity) => void }).requestDelete(
                      row.original,
                    ),
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

export function OpportunitiesTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Opportunity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ stage }), [stage]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Opportunity>({ endpoint: "/opportunities", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteOpportunity(pendingDelete.id);
      toast.success("Oportunidad eliminada correctamente");
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar la oportunidad");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar oportunidades..."
        filters={
          <FilterDropdown
            label="Etapa"
            value={stage}
            onChange={setStage}
            options={OPPORTUNITY_STAGES.map((value) => ({ value, label: OPPORTUNITY_STAGE_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons
            endpoint="/opportunities/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="oportunidades"
          />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/opportunities/new">
                <Plus />
                Nueva oportunidad
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
        emptyTitle="No hay oportunidades"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea una nueva oportunidad."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/opportunities/${id}/edit`),
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
        resourceName={pendingDelete?.client?.name}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
