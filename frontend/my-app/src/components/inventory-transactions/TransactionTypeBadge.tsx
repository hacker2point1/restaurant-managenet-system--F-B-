"use client";

import { Badge } from "@/components/ui/badge";

import type {
  InventoryTransactionType,
} from "@/types/inventoryTransaction";

interface Props {
  type: InventoryTransactionType;
}

const config: Record<
  InventoryTransactionType,
  {
    label: string;
    className: string;
  }
> = {
  purchase: {
    label: "Purchase",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  "stock-in": {
    label: "Stock In",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  "stock-out": {
    label: "Usage",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  wastage: {
    label: "Waste",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  return: {
    label: "Return",
    className:
      "border-purple-200 bg-purple-50 text-purple-700",
  },

  adjustment: {
    label: "Adjustment",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export default function TransactionTypeBadge({
  type,
}: Props) {
  const item = config[type];

  return (
    <Badge
      variant="outline"
      className={item.className}
    >
      {item.label}
    </Badge>
  );
}