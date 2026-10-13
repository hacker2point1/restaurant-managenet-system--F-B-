import { Skeleton } from "@/components/ui/skeleton";

export default function MenuItemSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 7 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />

            <Skeleton className="h-5 w-40" />

            <Skeleton className="ml-auto h-5 w-20" />

            <Skeleton className="h-5 w-20" />

            <Skeleton className="h-5 w-16" />
          </div>
        )
      )}
    </div>
  );
}