"use client";

import { Button } from "@/components/ui/button";
import type { ReviewPagination } from "@/types/review";

interface Props {
  pagination: ReviewPagination;
  onPageChange: (page: number) => void;
}

export function ReviewPaginationBar({
  pagination,
  onPageChange,
}: Props) {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span>{" "}
        of <span className="font-medium text-foreground">{total}</span> reviews
      </p>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="min-w-16 text-center text-sm">
          {page} / {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}