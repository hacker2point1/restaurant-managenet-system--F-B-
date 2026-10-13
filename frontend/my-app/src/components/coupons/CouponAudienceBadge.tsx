"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  customersCount: number;
}

export default function CouponAudienceBadge({
  customersCount,
}: Props) {
  if (customersCount === 0) {
    return (
      <Badge
        variant="outline"
        className="border-blue-200 bg-blue-50 text-blue-700"
      >
        All Customers
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-purple-200 bg-purple-50 text-purple-700"
    >
      Specific
    </Badge>
  );
}