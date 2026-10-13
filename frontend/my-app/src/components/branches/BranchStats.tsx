"use client";

import {
  Building2,
  CheckCircle2,
  CircleOff,
  Store,
} from "lucide-react";

interface BranchStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export function BranchStats({
  total,
  active,
  inactive,
}: BranchStatsProps) {
  const stats = [
    {
      title: "TOTAL BRANCHES",
      value: total,
      icon: Building2,
      iconClass:
        "bg-amber-50 text-amber-700",
    },
    {
      title: "OPERATING NOW",
      value: active,
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-50 text-emerald-600",
    },
    {
      title: "INACTIVE",
      value: inactive,
      icon: CircleOff,
      iconClass:
        "bg-slate-100 text-slate-600",
    },
    {
      title: "OPENING SOON",
      value: 0,
      icon: Store,
      iconClass:
        "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                  {stat.title}
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}