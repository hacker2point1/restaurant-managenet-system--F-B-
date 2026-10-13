"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import type {
  AppDispatch,
} from "@/redux/store/store";

import {
  createInventoryItem,
  updateInventoryItem,
} from "@/redux/slice/inventorySlice";

import type {
  InventoryFormData,
  InventoryItem,
  InventoryUnit,
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

  branchId: string;

  branches: {
    _id: string;
    name: string;
    restaurantName: string;
  }[];

  item: InventoryItem | null;

  loading: boolean;

  onSuccess?: () => void;
}

const emptyForm: InventoryFormData =
  {
    name: "",

    sku: "",

    unit: "kg",

    currentQuantity: "0",

    minimumStock: "0",

    maximumStock: "",

    unitCost: "0",

    supplierName: "",

    supplierPhone: "",

    supplierEmail: "",

    expiryDate: "",

    isActive: true,
  };

export default function InventoryFormDialog({
  open,
  onOpenChange,
  branchId,
  branches,
  item,
  loading,
  onSuccess,
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  const [
    form,
    setForm,
  ] = useState<InventoryFormData>(
    emptyForm
  );
  const [unselectedBranchId, setUnselectedBranchId] = useState("");
  const targetBranchId = branchId || unselectedBranchId;

  useEffect(() => {
    if (item) {
      setForm({
        name:
          item.name,

        sku:
          item.sku || "",

        unit:
          item.unit,

        currentQuantity:
          String(
            item.currentQuantity
          ),

        minimumStock:
          String(
            item.minimumStock
          ),

        maximumStock:
          item.maximumStock !==
          undefined
            ? String(
                item.maximumStock
              )
            : "",

        unitCost:
          String(
            item.unitCost
          ),

        supplierName:
          item.supplier
            ?.name || "",

        supplierPhone:
          item.supplier
            ?.phone || "",

        supplierEmail:
          item.supplier
            ?.email || "",

        expiryDate:
          item.expiryDate
            ? item.expiryDate.slice(
                0,
                10
              )
            : "",

        isActive:
          item.isActive,
      });
    } else {
      setForm(
        emptyForm
      );
    }
  }, [item, open, branchId]);

  const updateField = <
    K extends keyof InventoryFormData
  >(
    field: K,
    value: InventoryFormData[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    if (!item && !targetBranchId) {
      return;
    }

    if (item) {
      const result =
        await dispatch(
          updateInventoryItem({
            id: item._id,

            data: form,
          })
        );

      if (
        updateInventoryItem.fulfilled.match(
          result
        )
      ) {
        onSuccess?.();
        onOpenChange(false);
      }

      return;
    }

    const result =
      await dispatch(
        createInventoryItem({
          branchId: targetBranchId,

          data: form,
        })
      );

    if (
      createInventoryItem.fulfilled.match(
        result
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">

        <DialogHeader>
          <DialogTitle>
            {item
              ? "Edit Inventory Item"
              : "Add Inventory Item"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          {!item && !branchId && (
            <div className="space-y-2">
              <Label htmlFor="inventory-item-branch">Branch *</Label>
              <select
                id="inventory-item-branch"
                value={targetBranchId}
                onChange={(event) => setUnselectedBranchId(event.target.value)}
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.restaurantName} · {branch.name}
                  </option>
                ))}
              </select>
              {branches.length === 0 && (
                <p className="text-sm text-destructive">No branches are available.</p>
              )}
            </div>
          )}

          {/* NAME */}

          <div className="space-y-2">
            <Label>
              Item Name *
            </Label>

            <Input
              value={
                form.name
              }
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="e.g. Chicken"
              required
            />
          </div>

          {/* SKU */}

          <div className="space-y-2">
            <Label>
              SKU {item ? "" : "(generated automatically)"}
            </Label>

            <Input
              value={item?.sku || ""}
              readOnly
              placeholder={item ? "No SKU assigned" : "Generated when saved"}
              aria-label="Inventory SKU"
            />
            {!item && (
              <p className="text-xs text-muted-foreground">
                A unique SKU will be assigned when this item is created.
              </p>
            )}
          </div>

          {/* UNIT */}

          <div className="space-y-2">
            <Label>
              Unit *
            </Label>

            <Select
              value={
                form.unit
              }
              onValueChange={(
                value
              ) =>
                updateField(
                  "unit",
                  value as InventoryUnit
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="kg">
                  kg
                </SelectItem>

                <SelectItem value="gram">
                  gram
                </SelectItem>

                <SelectItem value="liter">
                  liter
                </SelectItem>

                <SelectItem value="ml">
                  ml
                </SelectItem>

                <SelectItem value="piece">
                  piece
                </SelectItem>

                <SelectItem value="packet">
                  packet
                </SelectItem>

                <SelectItem value="box">
                  box
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* QUANTITY */}

          {!item && (
            <div className="space-y-2">
              <Label>
                Current Quantity
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.currentQuantity
                }
                onChange={(event) =>
                  updateField(
                    "currentQuantity",
                    event.target.value
                  )
                }
              />
            </div>
          )}

          {/* MIN / MAX */}

          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>
                Minimum Stock
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.minimumStock
                }
                onChange={(event) =>
                  updateField(
                    "minimumStock",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Maximum Stock
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.maximumStock
                }
                onChange={(event) =>
                  updateField(
                    "maximumStock",
                    event.target.value
                  )
                }
              />
            </div>

          </div>

          {/* COST */}

          <div className="space-y-2">
            <Label>
              Unit Cost
            </Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={
                form.unitCost
              }
              onChange={(event) =>
                updateField(
                  "unitCost",
                  event.target.value
                )
              }
              placeholder="220"
            />
          </div>

          {/* SUPPLIER */}

          <div className="space-y-3">

            <Label>
              Supplier
            </Label>

            <div className="grid grid-cols-2 gap-3">

              <Input
                value={
                  form.supplierName
                }
                onChange={(event) =>
                  updateField(
                    "supplierName",
                    event.target.value
                  )
                }
                placeholder="Supplier name"
              />

              <Input
                value={
                  form.supplierPhone
                }
                onChange={(event) =>
                  updateField(
                    "supplierPhone",
                    event.target.value
                  )
                }
                placeholder="Phone"
              />

            </div>

            <Input
              type="email"
              value={
                form.supplierEmail
              }
              onChange={(event) =>
                updateField(
                  "supplierEmail",
                  event.target.value
                )
              }
              placeholder="Supplier email"
            />

          </div>

          {/* EXPIRY */}

          <div className="space-y-2">
            <Label>
              Expiry Date
            </Label>

            <Input
              type="date"
              value={
                form.expiryDate
              }
              onChange={(event) =>
                updateField(
                  "expiryDate",
                  event.target.value
                )
              }
            />
          </div>

          {/* ACTIVE */}

          <div className="flex items-center gap-2">

            <input
              id="inventory-item-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField(
                  "isActive",
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-[#9A6B2F]"
            />

            <Label htmlFor="inventory-item-active">
              Active
            </Label>

          </div>

          <DialogFooter>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                loading || (!item && !targetBranchId)
              }
              className="bg-[#9A6B2F] hover:bg-[#835A26]"
            >
              {loading
                ? "Saving..."
                : item
                  ? "Update Item"
                  : "Save Item"}
            </Button>

          </DialogFooter>

        </form>

      </DialogContent>
    </Dialog>
  );
}