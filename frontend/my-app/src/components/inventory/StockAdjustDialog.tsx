"use client";

import {
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import type {
  AppDispatch,
} from "@/redux/store/store";

import {
  updateInventoryStock,
} from "@/redux/slice/inventorySlice";

import type {
  InventoryItem,
  StockOperation,
} from "@/types/inventory";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Button,
} from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  item: InventoryItem | null;

  loading: boolean;

  onSuccess?: () => void;
}

export default function StockAdjustDialog({
  open,
  onOpenChange,
  item,
  loading,
  onSuccess,
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    operation,
    setOperation,
  ] =
    useState<StockOperation>(
      "add"
    );

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!item) {
      return;
    }

    const amount =
      Number(quantity);

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      return;
    }

    const result =
      await dispatch(
        updateInventoryStock({
          id: item._id,

          quantity: amount,

          operation,
        })
      );

    if (
      updateInventoryStock.fulfilled.match(
        result
      )
    ) {
      onSuccess?.();
      setQuantity("");

      setOperation("add");

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
          <DialogTitle>
            Adjust Stock
          </DialogTitle>
        </DialogHeader>

        {item && (
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            <div className="rounded-lg bg-muted/40 p-4">

              <p className="font-medium">
                {item.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Current stock:{" "}
                <span className="font-medium text-foreground">
                  {
                    item.currentQuantity
                  }{" "}
                  {item.unit}
                </span>
              </p>

            </div>

            <div className="space-y-2">
              <Label>
                Operation
              </Label>

              <Select
                value={
                  operation
                }
                onValueChange={(
                  value
                ) =>
                  setOperation(
                    value as StockOperation
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="add">
                    Add Stock
                  </SelectItem>

                  <SelectItem value="remove">
                    Remove Stock
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Quantity
              </Label>

              <Input
                type="number"
                min="1"
                value={
                  quantity
                }
                onChange={(event) =>
                  setQuantity(
                    event.target.value
                  )
                }
                placeholder="Enter quantity"
                required
              />
            </div>

            <DialogFooter>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onOpenChange(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  loading
                }
                className="bg-[#9A6B2F] hover:bg-[#835A26]"
              >
                {loading
                  ? "Updating..."
                  : "Update Stock"}
              </Button>

            </DialogFooter>

          </form>
        )}

      </DialogContent>
    </Dialog>
  );
}