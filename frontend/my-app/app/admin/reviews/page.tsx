"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  approveReview,
  fetchReviews,
  fetchReviewStatistics,
  hardDeleteReview,
  rejectReview,
  restoreReview,
  softDeleteReview,
} from "@/redux/slice/reviewSlice";

import type { Review, ReviewStatus } from "@/types/review";

import { ReviewStats } from "@/components/reviews/review-stats";
import { ReviewFilters } from "@/components/reviews/review-filters";
import { ReviewsTable } from "@/components/reviews/reviews-table";
import { ReviewDetailsDialog } from "@/components/reviews/review-details-dialog";
import { ReviewConfirmDialog } from "@/components/reviews/review-confirm-dialog";
import { ReviewPaginationBar } from "@/components/reviews/review-pagination";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type ConfirmAction = "approve" | "reject" | "delete" | null;

export default function ReviewsPage() {
  const dispatch = useAppDispatch();

  const {
    reviews,
    pagination,
    averageRating,
    ratingDistribution,
    loading,
    actionLoading,
  } = useAppSelector((state) => state.review);

  // Uses your existing global branch selection, if registered in the store.
  const selectedBranch = useAppSelector(
    (state) => state.branch.selectedBranch
  );

  const branchId = selectedBranch?._id;

  // The branch's restaurant reference may be either an ID or a populated object.
  const restaurantReference = (
    selectedBranch as
      | { restaurant?: string | { _id?: string } }
      | null
  )?.restaurant;

  const restaurantId =
    typeof restaurantReference === "string"
      ? restaurantReference
      : restaurantReference?._id;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionReview, setActionReview] = useState<Review | null>(null);

  const loadReviews = useCallback(() => {
    const filters: {
      page: number;
      limit: number;
      branch?: string;
      status?: ReviewStatus;
      rating?: number;
    } = {
      page,
      limit: 10,
    };

    if (branchId) filters.branch = branchId;

    if (status !== "all") {
      filters.status = status as ReviewStatus;
    }

    if (rating !== "all") {
      filters.rating = Number(rating);
    }

    dispatch(fetchReviews(filters));
  }, [dispatch, page, branchId, status, rating]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchReviewStatistics(restaurantId));
    }
  }, [dispatch, restaurantId]);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;

    return reviews.filter((review) => {
      const searchable = [
        review.customer?.name,
        review.customer?.email,
        review.restaurant?.name,
        review.menuItem?.name,
        review.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [reviews, search]);

  const openDetails = (review: Review) => {
    setSelectedReview(review);
    setDetailsOpen(true);
  };

  const askForConfirmation = (
    action: Exclude<ConfirmAction, null>,
    review: Review
  ) => {
    setActionReview(review);
    setConfirmAction(action);
  };

  const closeConfirmation = () => {
    if (actionLoading) return;
    setConfirmAction(null);
    setActionReview(null);
  };

  const confirmSelectedAction = async () => {
    if (!actionReview || !confirmAction) return;

    const id = actionReview._id;

    try {
      if (confirmAction === "approve") {
        await dispatch(approveReview(id)).unwrap();
        toast.success("Review approved.");
      } else if (confirmAction === "reject") {
        await dispatch(rejectReview(id)).unwrap();
        toast.success("Review rejected.");
      } else if (confirmAction === "delete") {
        await dispatch(softDeleteReview(id)).unwrap();
        toast.success("Review deleted.");
      }

      setConfirmAction(null);
      setActionReview(null);

      // Reload to keep pagination and totals in sync.
      loadReviews();

      if (restaurantId) {
        dispatch(fetchReviewStatistics(restaurantId));
      }
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "The action could not be completed."
      );
    }
  };

  const confirmDialogContent = {
    approve: {
      title: "Approve this review?",
      description:
        "This review will be marked as approved. Continue only if you want to publish it.",
      confirmText: "Approve Review",
      destructive: false,
    },
    reject: {
      title: "Reject this review?",
      description:
        "This review will be marked as rejected. You can change its status later.",
      confirmText: "Reject Review",
      destructive: true,
    },
    delete: {
      title: "Delete this review?",
      description:
        "This review will be moved to deleted records. You can restore it if needed.",
      confirmText: "Delete Review",
      destructive: true,
    },
  } as const;

  const confirmContent = confirmAction
    ? confirmDialogContent[confirmAction]
    : null;

  return (
    <div className="min-h-full space-y-6 bg-[#F7F8F7] p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          Reviews
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D2726]">
            Reviews &amp; Ratings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor customer feedback and manage review moderation.
          </p>
        </div>
      </div>

      <ReviewStats
        average={averageRating}
        distribution={ratingDistribution}
        loading={loading}
      />

      <Card className="overflow-hidden border-[#DFE4E2] shadow-sm">
        <CardContent className="p-0">
          <ReviewFilters
            search={search}
            status={status}
            rating={rating}
            onSearchChange={setSearch}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onRatingChange={(value) => {
              setRating(value);
              setPage(1);
            }}
          />

          <ReviewsTable
            reviews={filteredReviews}
            loading={loading}
            onView={openDetails}
            onApprove={(review) =>
              askForConfirmation("approve", review)
            }
            onReject={(review) =>
              askForConfirmation("reject", review)
            }
            onDelete={(review) =>
              askForConfirmation("delete", review)
            }
          />

          <ReviewPaginationBar
            pagination={pagination}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <ReviewDetailsDialog
        review={selectedReview}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {confirmContent && (
        <ReviewConfirmDialog
          open={Boolean(confirmAction)}
          loading={actionLoading}
          title={confirmContent.title}
          description={confirmContent.description}
          confirmText={confirmContent.confirmText}
          destructive={confirmContent.destructive}
          onOpenChange={(open) => {
            if (!open) closeConfirmation();
          }}
          onConfirm={confirmSelectedAction}
        />
      )}
    </div>
  );
}