"use client";

import { useCallback, useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse, PaginatedData } from "@/types/api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface UseServerTableOptions {
  endpoint: string;
  pageSize?: number;
  filters?: Record<string, string | undefined>;
}

export function useServerTable<T>({ endpoint, pageSize: initialPageSize = 10, filters = {} }: UseServerTableOptions) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 400);
  const filtersKey = JSON.stringify(filters);
  const queryKey = `${debouncedSearch}|${filtersKey}`;

  // Adjusting state during render (guarded by a comparison) is the
  // documented alternative to an effect for "reset on prop change".
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey);
  if (queryKey !== prevQueryKey) {
    setPrevQueryKey(queryKey);
    setPageIndex(0);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPage() {
      setIsLoading(true);
      setError(null);

      const sort = sorting[0];
      const params: Record<string, string | number> = {
        page: pageIndex + 1,
        per_page: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (sort) {
        params.sort = sort.id;
        params.sort_dir = sort.desc ? "desc" : "asc";
      }
      for (const [key, value] of Object.entries(filters)) {
        if (value) params[`filter[${key}]`] = value;
      }

      try {
        const response = await api.get<ApiSuccessResponse<PaginatedData<T>>>(endpoint, {
          params,
          signal: controller.signal,
        });
        setItems(response.data.data.items);
        setTotal(response.data.data.meta.total);
        setLastPage(response.data.data.meta.last_page);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "No fue posible cargar los datos");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void fetchPage();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filters is captured via filtersKey to avoid re-running on every new object literal
  }, [endpoint, pageIndex, pageSize, debouncedSearch, sorting, filtersKey, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    total,
    lastPage,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    search,
    setSearch,
    sorting,
    setSorting,
    refetch,
  };
}
