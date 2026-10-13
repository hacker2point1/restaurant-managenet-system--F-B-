import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuCategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[24px] border-0 p-0 shadow-sm">
      <div className="aspect-[4/4.1] min-h-[260px] sm:min-h-[280px]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    </Card>
  );
}