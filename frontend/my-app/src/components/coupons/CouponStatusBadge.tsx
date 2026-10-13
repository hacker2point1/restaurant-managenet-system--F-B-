"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  isActive: boolean;
  expiryDate: string;
}

export default function CouponStatusBadge({
  isActive,
  expiryDate,
}: Props) {
  if (!isActive) {
    return (
      <Badge
        variant="outline"
        className="border-gray-300 bg-gray-50 text-gray-600"
      >
        Inactive
      </Badge>
    );
  }

  const now = new Date();

  const expiry = new Date(expiryDate);

  const daysRemaining =
    Math.ceil(
      (expiry.getTime() -
        now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (daysRemaining < 0) {
    return (
      <Badge
        variant="outline"
        className="border-red-200 bg-red-50 text-red-600"
      >
        Expired
      </Badge>
    );
  }

  if (daysRemaining <= 7) {
    return (
      <Badge
        variant="outline"
        className="border-orange-200 bg-orange-50 text-orange-600"
      >
        Expiring Soon
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-emerald-200 bg-emerald-50 text-emerald-600"
    >
      Active
    </Badge>
  );
}