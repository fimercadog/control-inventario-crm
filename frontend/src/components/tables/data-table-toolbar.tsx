import type { ReactNode } from "react";
import { SearchInput } from "@/components/shared/search-input";

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  exportSlot?: ReactNode;
  actions?: ReactNode;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  exportSlot,
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        {filters}
      </div>
      <div className="flex items-center gap-2">
        {exportSlot}
        {actions}
      </div>
    </div>
  );
}
