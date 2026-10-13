
"use client";

import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function CustomerPagination({
  page, totalPages, total, limit, onPageChange,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="min-w-8 rounded-md bg-[#8B642F] px-3 py-1.5 text-center text-sm text-white">
          {page}
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
