"use client";

import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AverageRating,
  RatingDistributionItem,
} from "@/types/review";

interface Props {
  average: AverageRating | null;
  distribution: RatingDistributionItem[];
  loading: boolean;
}

export function ReviewStats({
  average,
  distribution,
  loading,
}: Props) {
  const total = average?.totalReviews ?? 0;

  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: distribution.find((item) => item.rating === rating)?.count ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.8fr]">
      <Card className="shadow-sm">
        <CardContent className="flex min-h-60 flex-col items-center justify-center p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Average Rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-5xl font-bold tracking-tight">
              {loading ? "—" : (average?.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="mt-3 text-sm text-muted-foreground">/ 5</span>
          </div>

          <div className="mt-2 flex text-amber-500">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < Math.round(average?.averageRating ?? 0)
                    ? "fill-current"
                    : "text-muted"
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {loading ? "Loading reviews..." : `Based on ${total} approved reviews`}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {counts.map(({ rating, count }) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div
                key={rating}
                className="grid grid-cols-[26px_1fr_42px] items-center gap-3"
              >
                <span className="text-sm text-muted-foreground">
                  {rating} ★
                </span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#B38A4A] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-right text-xs text-muted-foreground">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}