"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="mt-3 h-4 w-20" />
              </div>

              <Skeleton className="h-7 w-7 rounded-full" />
            </div>

            <Skeleton className="mt-8 h-4 w-20" />

            <Skeleton className="mt-2 h-5 w-24" />

            <Skeleton className="mt-6 h-5 w-20" />
          </div>
        )
      )}
    </div>
  );
}