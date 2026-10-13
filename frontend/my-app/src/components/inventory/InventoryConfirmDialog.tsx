"use client";

import {
  useDispatch,
} from "react-redux";

import type {
  AppDispatch,
} from "@/redux/store/store";

import {
  softDeleteInventoryItem,
  restoreInventoryItem,
  hardDeleteInventoryItem,
} from "@/redux/slice/inventorySlice";

import type {
  InventoryItem,
} from "@/types/inventory";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  AlertTriangle,
  RotateCcw,
  Trash2,
} from "lucide-react";

type ActionType =
  | "delete"
  | "restore"
  | "hardDelete";

interface Props {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  type: ActionType;

  item: InventoryItem | null;

  loading: boolean;

  onSuccess?: () => void;
}

export default function InventoryConfirmDialog({
  open,
  onOpenChange,
  type,
  item,
  loading,
  onSuccess,
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  if (!item) {
    return null;
  }

  const config = {
    delete: {
      title:
        "Delete Inventory Item?",

      description:
        "This item will be moved to the deleted inventory. You can restore it later.",

      button:
        "Delete Item",

      icon: Trash2,
    },

    restore: {
      title:
        "Restore Inventory Item?",

      description:
        "This item will be restored to the active inventory.",

      button:
        "Restore Item",

      icon: RotateCcw,
    },

    hardDelete: {
      title:
        "Permanently Delete Item?",

      description:
        "This action cannot be undone. The inventory item will be permanently removed from the database.",

      button:
        "Permanently Delete",

      icon: AlertTriangle,
    },
  }[type];

  const Icon =
    config.icon;

  const handleConfirm =
    async () => {
      let result;

      if (
        type ===
        "delete"
      ) {
        result =
          await dispatch(
            softDeleteInventoryItem(
              item._id
            )
          );
      }

      if (
        type ===
        "restore"
      ) {
        result =
          await dispatch(
            restoreInventoryItem(
              item._id
            )
          );
      }

      if (
        type ===
        "hardDelete"
      ) {
        result =
          await dispatch(
            hardDeleteInventoryItem(
              item._id
            )
          );
      }

      if (
        result &&
        (
          softDeleteInventoryItem.fulfilled.match(
            result
          ) ||
          restoreInventoryItem.fulfilled.match(
            result
          ) ||
          hardDeleteInventoryItem.fulfilled.match(
            result
          )
        )
      ) {
        onSuccess?.();
        onOpenChange(false);
      }
    };

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="sm:max-w-[450px]">

        <DialogHeader>

          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">

            <Icon className="h-5 w-5" />

          </div>

          <DialogTitle>
            {config.title}
          </DialogTitle>

          <DialogDescription>
            {config.description}
          </DialogDescription>

        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">

          <p className="font-medium">
            {item.name}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            SKU:{" "}
            {item.sku ||
              "Not assigned"}
          </p>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(
                false
              )
            }
            disabled={
              loading
            }
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleConfirm
            }
            disabled={
              loading
            }
            variant={
              type ===
              "hardDelete"
                ? "destructive"
                : "default"
            }
            className={
              type !==
              "hardDelete"
                ? "bg-[#9A6B2F] hover:bg-[#835A26]"
                : ""
            }
          >
            {loading
              ? "Processing..."
              : config.button}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}