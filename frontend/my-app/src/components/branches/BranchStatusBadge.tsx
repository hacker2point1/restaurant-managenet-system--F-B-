"use client";

import { Badge } from "@/components/ui/badge";

interface BranchStatusBadgeProps {
  isActive: boolean;
}

export function BranchStatusBadge({
  isActive,
}: BranchStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}