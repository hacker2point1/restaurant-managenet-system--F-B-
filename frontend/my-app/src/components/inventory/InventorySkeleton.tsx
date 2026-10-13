"use client";

import {
  Skeleton,
} from "@/components/ui/skeleton";

export default function InventorySkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">

      <div className="space-y-0">

        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b p-5"
          >
            <Skeleton className="h-5 w-32" />

            <Skeleton className="h-5 w-20" />

            <Skeleton className="h-5 w-12" />

            <Skeleton className="h-5 w-12" />

            <Skeleton className="h-5 w-20" />

            <Skeleton className="h-5 w-16" />

            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-8 w-24" />
          </div>
        ))}

      </div>

    </div>
  );
}