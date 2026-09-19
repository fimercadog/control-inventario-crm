"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  basePath: string;
}

export function Pagination({ currentPage, lastPage, basePath }: PaginationProps) {
  const searchParams = useSearchParams();

  if (lastPage <= 1) return null;

  function hrefForPage(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === lastPage || Math.abs(page - currentPage) <= 1,
  );

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= lastPage;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
      {isFirstPage ? (
        <Button variant="outline" size="icon" disabled aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </Button>
      ) : (
        <Button asChild variant="outline" size="icon">
          <Link href={hrefForPage(currentPage - 1)} aria-label="Página anterior">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
      )}

      {pages.map((page, index) => (
        <span key={page} className="flex items-center gap-2">
          {index > 0 && pages[index - 1] !== page - 1 && <span className="text-muted-foreground">…</span>}
          <Button asChild variant={page === currentPage ? "default" : "outline"} size="icon">
            <Link href={hrefForPage(page)} aria-current={page === currentPage ? "page" : undefined}>
              {page}
            </Link>
          </Button>
        </span>
      ))}

      {isLastPage ? (
        <Button variant="outline" size="icon" disabled aria-label="Página siguiente">
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        <Button asChild variant="outline" size="icon">
          <Link href={hrefForPage(currentPage + 1)} aria-label="Página siguiente">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      )}
    </nav>
  );
}
