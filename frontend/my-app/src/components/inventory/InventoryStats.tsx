"use client";

import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  IndianRupee,
} from "lucide-react";

import type {
  InventoryStats as Stats,
} from "@/types/inventory";

interface Props {
  stats: Stats;
}

export default function InventoryStats({
  stats,
}: Props) {
  const cards = [
    {
      title: "TOTAL ITEMS",
      value: stats.total,
      icon: Package,
    },
    {
      title: "IN STOCK",
      value: stats.inStock,
      icon: CheckCircle2,
    },
    {
      title: "LOW STOCK",
      value: stats.lowStock,
      icon: AlertTriangle,
    },
    {
      title: "OUT OF STOCK",
      value: stats.outOfStock,
      icon: XCircle,
    },
    {
      title: "INVENTORY VALUE",
      value: `₹${(
        stats.inventoryValue /
        1000
      ).toFixed(1)}k`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

      {cards.map((card) => {
        const Icon =
          card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {card.value}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F7F1E8] text-[#9A6B2F]">
                <Icon className="h-5 w-5" />
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}