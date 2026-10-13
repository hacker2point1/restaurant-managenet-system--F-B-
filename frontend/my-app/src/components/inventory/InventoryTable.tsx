"use client";

import {
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  InventoryItem,
} from "@/types/inventory";

import InventoryStatusBadge from "./InventoryStatusBadge";

interface Props {
  items: InventoryItem[];

  onAdjust: (
    item: InventoryItem
  ) => void;

  onEdit: (
    item: InventoryItem
  ) => void;

  onDelete: (
    item: InventoryItem
  ) => void;
}

export default function InventoryTable({
  items,
  onAdjust,
  onEdit,
  onDelete,
}: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border bg-white p-16 text-center shadow-sm">

        <h3 className="text-lg font-semibold">
          No inventory items found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first inventory
          item to get started.
        </p>

      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b bg-muted/30 text-left">

              <th className="px-4 py-4 font-medium">
                INGREDIENT
              </th>

              <th className="px-4 py-4 font-medium">
                SKU
              </th>

              <th className="px-4 py-4 font-medium">
                QTY
              </th>

              <th className="px-4 py-4 font-medium">
                UNIT
              </th>

              <th className="px-4 py-4 font-medium">
                MIN/MAX LEVEL
              </th>

              <th className="px-4 py-4 font-medium">
                UNIT COST
              </th>

              <th className="px-4 py-4 font-medium">
                SUPPLIER
              </th>

              <th className="px-4 py-4 font-medium">
                EXPIRY
              </th>

              <th className="px-4 py-4 font-medium">
                STATUS
              </th>

              <th className="px-4 py-4 text-right font-medium">
                ACTIONS
              </th>

            </tr>
          </thead>

          <tbody>

            {items.map((item) => {

              const percentage =
                item.maximumStock &&
                item.maximumStock > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (item.currentQuantity /
                          item.maximumStock) *
                          100
                      )
                    )
                  : 0;

              return (
                <tr
                  key={item._id}
                  className="border-b last:border-0 hover:bg-muted/20"
                >

                  {/* NAME */}

                  <td className="px-4 py-4">

                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="mt-1 flex items-center gap-2">

                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">

                        <div
                          className="h-full rounded-full bg-[#9A6B2F]"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <span className="text-xs text-muted-foreground">
                        {percentage}%
                      </span>

                    </div>

                  </td>

                  {/* SKU */}

                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                    {item.sku ||
                      "—"}
                  </td>

                  {/* QTY */}

                  <td className="px-4 py-4">

                    <span
                      className={
                        item.currentQuantity ===
                        0
                          ? "font-semibold text-red-600"
                          : "font-semibold"
                      }
                    >
                      {
                        item.currentQuantity
                      }
                    </span>

                  </td>

                  {/* UNIT */}

                  <td className="px-4 py-4 text-muted-foreground">
                    {item.unit}
                  </td>

                  {/* MIN MAX */}

                  <td className="px-4 py-4 text-muted-foreground">
                    {item.minimumStock}
                    {" / "}
                    {item.maximumStock ??
                      "—"}
                  </td>

                  {/* COST */}

                  <td className="px-4 py-4 font-medium">
                    ₹
                    {item.unitCost.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  {/* SUPPLIER */}

                  <td className="px-4 py-4 text-muted-foreground">
                    {
                      item.supplier
                        ?.name
                    }
                    {!item.supplier
                      ?.name &&
                      "—"}
                  </td>

                  {/* EXPIRY */}

                  <td className="px-4 py-4 text-muted-foreground">
                    {item.expiryDate
                      ? new Date(
                          item.expiryDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">
                    <InventoryStatusBadge
                      item={item}
                    />
                  </td>

                  {/* ACTIONS */}

                  <td className="px-4 py-4">

                    <div className="flex justify-end gap-2">

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onAdjust(
                            item
                          )
                        }
                      >
                        <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />

                        Adjust
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onEdit(
                            item
                          )
                        }
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />

                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          onDelete(
                            item
                          )
                        }
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />

                        Delete
                      </Button>

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}