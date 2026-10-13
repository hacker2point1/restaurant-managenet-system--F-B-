"use client";

import {
  CheckCircle2,
  Clock3,
  CircleCheck,
  XCircle,
} from "lucide-react";

import { ReservationStats as Stats } from "@/types/reservation";

interface Props {
  stats: Stats;
}

export default function ReservationStats({
  stats,
}: Props) {
  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: CircleCheck,
      className: "text-slate-800",
    },

    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      className: "text-blue-600",
    },

    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      className: "text-amber-600",
    },

    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      className: "text-emerald-600",
    },

    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      className: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-2xl font-bold ${card.className}`}
                >
                  {card.value}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {card.label}
                </p>
              </div>

              <Icon
                className={`h-5 w-5 ${card.className}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}