"use client";

import {
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  InventoryItem,
} from "@/types/inventory";

interface Props {
  items: InventoryItem[];

  onRestore: (
    item: InventoryItem
  ) => void;

  onHardDelete: (
    item: InventoryItem
  ) => void;
}

export default function DeletedInventoryTable({
  items,
  onRestore,
  onHardDelete,
}: Props) {
  if (!items.length) {
    return (
      <div className="py-16 text-center">

        <RotateCcw className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

        <h3 className="text-lg font-semibold">
          No deleted items
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Deleted inventory items will
          appear here.
        </p>

      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead>
          <tr className="border-b text-left">

            <th className="px-4 py-4">
              INGREDIENT
            </th>

            <th className="px-4 py-4">
              SKU
            </th>

            <th className="px-4 py-4">
              UNIT
            </th>

            <th className="px-4 py-4">
              QUANTITY
            </th>

            <th className="px-4 py-4">
              DELETED ON
            </th>

            <th className="px-4 py-4 text-right">
              ACTIONS
            </th>

          </tr>
        </thead>

        <tbody>

          {items.map((item) => (
            <tr
              key={item._id}
              className="border-b last:border-0"
            >

              <td className="px-4 py-4 font-medium">
                {item.name}
              </td>

              <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                {item.sku ||
                  "—"}
              </td>

              <td className="px-4 py-4 text-muted-foreground">
                {item.unit}
              </td>

              <td className="px-4 py-4">
                {item.currentQuantity}
              </td>

              <td className="px-4 py-4 text-muted-foreground">
                {item.deletedAt
                  ? new Date(
                      item.deletedAt
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "—"}
              </td>

              <td className="px-4 py-4">

                <div className="flex justify-end gap-2">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onRestore(
                        item
                      )
                    }
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />

                    Restore
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() =>
                      onHardDelete(
                        item
                      )
                    }
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />

                    Permanent Delete
                  </Button>

                </div>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}