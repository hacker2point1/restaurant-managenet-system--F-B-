import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Skeleton,
} from "@/components/ui/skeleton";

export default function MenuCategorySkeleton() {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-7 w-20" />
        </div>

        <Skeleton className="mt-5 h-5 w-32" />

        <Skeleton className="mt-2 h-4 w-full" />

        <Skeleton className="mt-1 h-4 w-3/4" />

        <div className="my-5 border-t" />

        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}