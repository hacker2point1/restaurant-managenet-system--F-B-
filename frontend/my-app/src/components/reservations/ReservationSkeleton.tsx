"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationSkeleton() {
  return (
    <div className="rounded-xl border bg-white">
      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[300px]" />

          <Skeleton className="h-10 w-[130px]" />

          <Skeleton className="h-10 w-[180px]" />

          <Skeleton className="h-10 w-[130px]" />
        </div>

        <div className="space-y-0 rounded-lg border">
          {Array.from({ length: 7 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex items-center gap-6 border-b p-5 last:border-0"
              >
                <Skeleton className="h-4 w-4" />

                <Skeleton className="h-4 w-20" />

                <Skeleton className="h-10 w-40" />

                <Skeleton className="h-10 w-28" />

                <Skeleton className="h-5 w-10" />

                <Skeleton className="h-5 w-14" />

                <Skeleton className="h-5 w-28" />

                <Skeleton className="h-6 w-20" />

                <Skeleton className="ml-auto h-8 w-8" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}