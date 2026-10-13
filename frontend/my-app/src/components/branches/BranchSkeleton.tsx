"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BranchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-32 rounded-2xl"
            />
          )
        )}
      </div>

      <Skeleton className="h-[400px] rounded-2xl" />
    </div>
  );
}