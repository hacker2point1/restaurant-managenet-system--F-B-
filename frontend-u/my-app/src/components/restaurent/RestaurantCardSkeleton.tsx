import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[22px] border border-slate-200 p-0">
      <Skeleton className="h-56 w-full rounded-none sm:h-60" />

      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-5 h-4 w-1/2" />

        <div className="flex justify-between border-t border-slate-100 pt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}