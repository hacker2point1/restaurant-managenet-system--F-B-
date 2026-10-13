"use client";

import {
  ArrowDown,
  ArrowUp,
  Scale,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type {
  TransactionReport,
} from "@/types/inventoryTransaction";

interface Props {
  report: TransactionReport | null;
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export default function InventoryTransactionStats({
  report,
  loading,
}: Props) {
  const byType = report?.byType || [];

  const getType = (type: string) =>
    byType.find((item) => item._id === type);

  const stockReceived =
    (getType("purchase")?.totalValue || 0) +
    (getType("stock-in")?.totalValue || 0) +
    (getType("return")?.totalValue || 0);

  const stockUsed =
    (getType("stock-out")?.totalValue || 0) +
    (getType("wastage")?.totalValue || 0);

  const adjustments =
    getType("adjustment")?.transactionCount || 0;

  const waste =
    getType("wastage")?.totalValue || 0;

  const cards = [
    {
      title: "STOCK RECEIVED",
      value: formatCurrency(stockReceived),
      icon: ArrowDown,
      iconClass:
        "bg-emerald-50 text-emerald-600",
    },
    {
      title: "STOCK USED",
      value: formatCurrency(stockUsed),
      icon: ArrowUp,
      iconClass:
        "bg-blue-50 text-blue-600",
    },
    {
      title: "ADJUSTMENTS",
      value: adjustments.toString(),
      icon: Scale,
      iconClass:
        "bg-amber-50 text-amber-700",
    },
    {
      title: "WASTE THIS MONTH",
      value: formatCurrency(waste),
      icon: Trash2,
      iconClass:
        "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="rounded-xl border shadow-sm"
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                  {card.title}
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-28 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                )}
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}