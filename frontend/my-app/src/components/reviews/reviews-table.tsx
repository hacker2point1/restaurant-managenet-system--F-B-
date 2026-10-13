"use client";

import { Eye, Check, X, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewStatusBadge } from "./review-status-badge";
import type { Review } from "@/types/review";

interface Props {
  reviews: Review[];
  loading: boolean;
  onView: (review: Review) => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onDelete: (review: Review) => void;
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="flex text-amber-500">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              index < value ? "fill-current" : "text-muted"
            }`}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

export function ReviewsTable({
  reviews,
  loading,
  onView,
  onApprove,
  onReject,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="min-w-44">Customer</TableHead>
            <TableHead className="min-w-36">Restaurant</TableHead>
            <TableHead className="min-w-36">Menu Item</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="min-w-64">Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="min-w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                Loading reviews...
              </TableCell>
            </TableRow>
          )}

          {!loading && reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No reviews found for these filters.
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            reviews.map((review) => {
              const customerName = review.customer?.name || "Unknown customer";

              return (
                <TableRow key={review._id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {customerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customerName}</p>
                        <p className="max-w-36 truncate text-xs text-muted-foreground">
                          {review.customer?.email || ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {review.restaurant?.name || "—"}
                  </TableCell>

                  <TableCell className="font-medium">
                    {review.menuItem?.name || "—"}
                  </TableCell>

                  <TableCell>
                    <Rating value={review.rating} />
                  </TableCell>

                  <TableCell>
                    <p className="max-w-72 truncate text-sm text-muted-foreground">
                      {review.comment || "No comment"}
                    </p>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {shortDate(review.createdAt)}
                  </TableCell>

                  <TableCell>
                    <ReviewStatusBadge status={review.status} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {review.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Approve review"
                            onClick={() => onApprove(review)}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reject review"
                            onClick={() => onReject(review)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        title="View review"
                        onClick={() => onView(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete review"
                        onClick={() => onDelete(review)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}