"use client";

interface Props {
  item: {
    currentQuantity: number;
    minimumStock: number;
  };
}

export default function InventoryStatusBadge({
  item,
}: Props) {
  if (
    item.currentQuantity ===
    0
  ) {
    return (
      <span className="inline-flex rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        Out of Stock
      </span>
    );
  }

  if (
    item.currentQuantity <=
    item.minimumStock
  ) {
    return (
      <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      In Stock
    </span>
  );
}