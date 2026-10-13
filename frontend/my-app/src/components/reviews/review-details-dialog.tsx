"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ReviewStatusBadge } from "./review-status-badge";
import type { Review } from "@/types/review";

interface Props {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function ReviewDetailsDialog({
  review,
  open,
  onOpenChange,
}: Props) {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Review details</DialogTitle>
          <DialogDescription>
            Review information and moderation history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="font-semibold">
              {review.customer?.name || "Unknown customer"}
            </p>
            <p className="text-sm text-muted-foreground">
              {review.customer?.email || "No email available"}
            </p>
          </div>

          <ReviewStatusBadge status={review.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Detail
            label="Restaurant"
            value={review.restaurant?.name}
          />
          <Detail
            label="Branch"
            value={
              typeof review.branch === "object"
                ? review.branch?.name
                : undefined
            }
          />
          <Detail
            label="Menu item"
            value={review.menuItem?.name}
          />
          <Detail label="Rating" value={`${review.rating} / 5`} />
          <Detail label="Submitted" value={formatDate(review.createdAt)} />
          <Detail label="Moderated at" value={formatDate(review.moderatedAt)} />
          <Detail
            label="Moderated by"
            value={review.moderatedBy?.name}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-semibold">Customer comment</p>
          <div className="min-h-20 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
            {review.comment || "No comment provided."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}