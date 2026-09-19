"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  total: number;
  lastPage: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  total,
  lastPage,
  onPageIndexChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTablePaginationProps) {
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex + 1 >= lastPage;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        {total === 0 ? "Sin registros" : `Mostrando ${from}-${to} de ${total} registros`}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Por página</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Primera página"
            disabled={isFirstPage}
            onClick={() => onPageIndexChange(0)}
          >
            <ChevronFirst className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Página anterior"
            disabled={isFirstPage}
            onClick={() => onPageIndexChange(pageIndex - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-sm whitespace-nowrap">
            Página {total === 0 ? 0 : pageIndex + 1} de {lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Página siguiente"
            disabled={isLastPage}
            onClick={() => onPageIndexChange(pageIndex + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Última página"
            disabled={isLastPage}
            onClick={() => onPageIndexChange(lastPage - 1)}
          >
            <ChevronLast className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
