"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Separator,
} from "@/components/ui/separator";

import CouponStatusBadge from "./CouponStatusBadge";

import CouponAudienceBadge from "./CouponAudienceBadge";

import type { Coupon } from "@/types/coupon";

interface Props {
  open: boolean;

  coupon: Coupon | null;

  loading: boolean;

  onOpenChange: (
    open: boolean
  ) => void;
}

const currency = (
  value?: number
) =>
  value === undefined
    ? "—"
    : new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }
      ).format(value);

export default function CouponDetailsDialog({
  open,
  coupon,
  loading,
  onOpenChange,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Coupon Details
          </DialogTitle>

          <DialogDescription>
            Complete information about this coupon.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded bg-muted" />
          </div>
        ) : coupon ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded bg-muted px-2 py-1 font-mono font-semibold">
                  {coupon.code}
                </span>

                <p className="mt-2 text-sm text-muted-foreground">
                  {coupon.description ||
                    "No description"}
                </p>
              </div>

              <CouponStatusBadge
                isActive={
                  coupon.isActive
                }
                expiryDate={
                  coupon.expiryDate
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Discount
                </p>

                <p className="mt-1 font-semibold">
                  {coupon.discountType ===
                  "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `${currency(
                        coupon.discountValue
                      )} OFF`}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Minimum Order
                </p>

                <p className="mt-1 font-semibold">
                  {currency(
                    coupon.minimumOrderAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Maximum Discount
                </p>

                <p className="mt-1 font-semibold">
                  {currency(
                    coupon.maximumDiscountAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Usage
                </p>

                <p className="mt-1 font-semibold">
                  {coupon.usageCount}
                  {coupon.usageLimit
                    ? ` / ${coupon.usageLimit}`
                    : " / Unlimited"}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">
                Audience
              </p>

              <div className="mt-2">
                <CouponAudienceBadge
                  customersCount={
                    coupon
                      .applicableCustomers
                      ?.length || 0
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Applicable Branches
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {coupon
                  .applicableBranches
                  ?.length ? (
                  coupon.applicableBranches.map(
                    (branch) => (
                      <span
                        key={
                          branch._id
                        }
                        className="rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {branch.name}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-sm text-muted-foreground">
                    All branches
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Coupon not found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}