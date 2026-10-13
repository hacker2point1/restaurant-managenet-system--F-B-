"use client";

import { useEffect, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Package,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  InventoryTransactionType,
} from "@/types/inventoryTransaction";

interface InventoryItemOption {
  _id: string;
  name: string;
  sku?: string;
  unit: string;
  currentQuantity?: number;
  branchName?: string;
}

interface Props {
  open: boolean;

  items: InventoryItemOption[];

  itemsLoading?: boolean;

  loading?: boolean;

  onOpenChange: (open: boolean) => void;

  onSubmit: (
    data: {
      type: InventoryTransactionType;
      inventoryItem: string;
      quantity?: number;
      unitCost?: number;
      newQuantity?: number;
      reason?: string;
      referenceId?: string;
    }
  ) => void;
}

const transactionTypes = [
  {
    value: "stock-in",
    label: "Stock In",
    icon: ArrowDown,
  },
  {
    value: "stock-out",
    label: "Stock Out",
    icon: ArrowUp,
  },
  {
    value: "purchase",
    label: "Purchase",
    icon: Package,
  },
  {
    value: "wastage",
    label: "Wastage",
    icon: Trash2,
  },
  {
    value: "return",
    label: "Return",
    icon: RotateCcw,
  },
  {
    value: "adjustment",
    label: "Adjustment",
    icon: Scale,
  },
] as const;

export default function TransactionFormDialog({
  open,
  items,
  itemsLoading = false,
  loading = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const [type, setType] =
    useState<InventoryTransactionType>(
      "stock-in"
    );

  const [inventoryItem, setInventoryItem] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [unitCost, setUnitCost] =
    useState("");

  const [newQuantity, setNewQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [referenceId, setReferenceId] =
    useState("");

  useEffect(() => {
    if (!open) {
      setInventoryItem("");
      setQuantity("");
      setUnitCost("");
      setNewQuantity("");
      setReason("");
      setReferenceId("");
      setType("stock-in");
    }
  }, [open]);

  const selectedItem = items.find(
    (item) => item._id === inventoryItem
  );

  const needsQuantity =
    type !== "adjustment";

  const needsUnitCost =
    type === "stock-in" ||
    type === "purchase";

  const needsNewQuantity =
    type === "adjustment";

  const needsReason =
    type === "wastage" ||
    type === "adjustment";

  const canSubmit =
    inventoryItem &&
    (needsQuantity
      ? Number(quantity) > 0
      : true) &&
    (needsNewQuantity
      ? Number(newQuantity) >= 0
      : true) &&
    (needsReason
      ? reason.trim().length > 0
      : true) &&
    (type === "purchase"
      ? Number(unitCost) >= 0
      : true);

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!canSubmit) return;

    onSubmit({
      type,
      inventoryItem,
      quantity: needsQuantity
        ? Number(quantity)
        : undefined,
      unitCost: needsUnitCost
        ? Number(unitCost || 0)
        : undefined,
      newQuantity: needsNewQuantity
        ? Number(newQuantity)
        : undefined,
      reason:
        reason.trim() || undefined,
      referenceId:
        referenceId.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Record Inventory Transaction
          </DialogTitle>

          <DialogDescription>
            Record a stock movement for an inventory item.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>
              Transaction Type
            </Label>

            <Select
              value={type}
              onValueChange={(value) =>
                setType(
                  value as InventoryTransactionType
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {transactionTypes.map(
                  (transaction) => {
                    const Icon =
                      transaction.icon;

                    return (
                      <SelectItem
                        key={transaction.value}
                        value={transaction.value}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {transaction.label}
                        </div>
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Inventory Item
            </Label>

            <Select
              value={inventoryItem}
              onValueChange={
                setInventoryItem
              }
              disabled={itemsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inventory item" />
              </SelectTrigger>

              <SelectContent>
                {itemsLoading ? (
                  <SelectItem value="loading-inventory-items" disabled>
                    Loading inventory items...
                  </SelectItem>
                ) : items.length === 0 ? (
                  <SelectItem value="no-inventory-items" disabled>
                    No inventory items available
                  </SelectItem>
                ) : items.map((item) => (
                  <SelectItem
                    key={item._id}
                    value={item._id}
                  >
                    <div>
                      <div className="font-medium">
                        {item.name}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {item.sku || "No SKU"} •{" "}
                        {item.unit}
                        {item.branchName ? ` · ${item.branchName}` : ""}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedItem &&
              selectedItem.currentQuantity !==
                undefined && (
                <p className="text-xs text-muted-foreground">
                  Current stock:{" "}
                  <span className="font-medium text-foreground">
                    {
                      selectedItem.currentQuantity
                    }{" "}
                    {selectedItem.unit}
                  </span>
                </p>
              )}
          </div>

          {needsQuantity && (
            <div className="space-y-2">
              <Label>
                Quantity
              </Label>

              <Input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter quantity"
              />
            </div>
          )}

          {needsNewQuantity && (
            <div className="space-y-2">
              <Label>
                New Quantity
              </Label>

              <Input
                type="number"
                min="0"
                step="any"
                value={newQuantity}
                onChange={(e) =>
                  setNewQuantity(
                    e.target.value
                  )
                }
                placeholder="Enter adjusted quantity"
              />
            </div>
          )}

          {needsUnitCost && (
            <div className="space-y-2">
              <Label>
                Unit Cost
              </Label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) =>
                  setUnitCost(e.target.value)
                }
                placeholder="₹ 0.00"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Reference ID
              <span className="ml-1 text-xs text-muted-foreground">
                (Optional)
              </span>
            </Label>

            <Input
              value={referenceId}
              onChange={(e) =>
                setReferenceId(
                  e.target.value
                )
              }
              placeholder="Order / PO / reference ID"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Reason
              {needsReason && (
                <span className="ml-1 text-destructive">
                  *
                </span>
              )}
            </Label>

            <Textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Enter reason..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                !canSubmit || loading
              }
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}