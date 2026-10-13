"use client";

import { cn } from "@/lib/utils";

import {
  ReservationStatus,
} from "@/types/reservation";

interface Props {
  status: ReservationStatus;
}

export default function ReservationStatusBadge({
  status,
}: Props) {
  const config = {
    confirmed: {
      label: "Confirmed",
      className:
        "border-blue-200 bg-blue-50 text-blue-600",
    },

    pending: {
      label: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    completed: {
      label: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-600",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-600",
    },

    "no-show": {
      label: "No-show",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    },
  };

  const item = config[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}