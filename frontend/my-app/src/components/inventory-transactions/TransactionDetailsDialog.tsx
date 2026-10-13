"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import TransactionTypeBadge from "./TransactionTypeBadge";

import type {
  InventoryTransaction,
} from "@/types/inventoryTransaction";

interface Props {
  open: boolean;

  transaction:
    | InventoryTransaction
    | null;

  loading?: boolean;

  onOpenChange: (open: boolean) => void;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function TransactionDetailsDialog({
  open,
  transaction,
  loading = false,
  onOpenChange,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            Transaction Details
          </DialogTitle>

          <DialogDescription>
            Complete information about this inventory transaction.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
          </div>
        ) : transaction ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Transaction ID
                </p>

                <p className="font-mono text-sm font-semibold">
                  {transaction._id}
                </p>
              </div>

              <TransactionTypeBadge
                type={transaction.type}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Inventory Item
                </p>

                <p className="mt-1 font-medium">
                  {
                    transaction
                      .inventoryItem.name
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  {
                    transaction
                      .inventoryItem.sku
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Branch
                </p>

                <p className="mt-1 font-medium">
                  {transaction.branch.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Quantity
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {transaction.quantity}{" "}
                  {
                    transaction
                      .inventoryItem.unit
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Unit Cost
                </p>

                <p className="mt-1 font-medium">
                  {currency(
                    transaction.unitCost
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Previous Quantity
                </p>

                <p className="mt-1 font-medium">
                  {
                    transaction
                      .previousQuantity
                  }{" "}
                  {
                    transaction
                      .inventoryItem.unit
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  New Quantity
                </p>

                <p className="mt-1 font-medium">
                  {
                    transaction.newQuantity
                  }{" "}
                  {
                    transaction
                      .inventoryItem.unit
                  }
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Recorded By
                </p>

                <p className="mt-1 font-medium">
                  {
                    transaction
                      .performedBy.name
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  {
                    transaction
                      .performedBy.email
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Date & Time
                </p>

                <p className="mt-1 font-medium">
                  {formatDate(
                    transaction.transactionDate
                  )}
                </p>
              </div>
            </div>

            {transaction.referenceType && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Reference
                </p>

                <p className="mt-1 font-medium">
                  {transaction.referenceType}
                  {transaction.referenceId
                    ? ` • ${transaction.referenceId}`
                    : ""}
                </p>
              </div>
            )}

            {transaction.reason && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Reason
                </p>

                <p className="mt-1 text-sm">
                  {transaction.reason}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Transaction not found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}