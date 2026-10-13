"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
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

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Coupon,
  CouponFormData,
  CouponSubmitData,
} from "@/types/coupon";

interface Branch {
  _id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
}

interface Props {
  open: boolean;

  coupon?: Coupon | null;

  restaurantId: string;

  branches: Branch[];
  branchesLoading: boolean;
  branchesError: string | null;

  customers: Customer[];

  loading?: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  onSubmit: (
    data: CouponSubmitData
  ) => void | Promise<void>;
}

const initialForm: CouponFormData = {
  restaurant: "",

  code: "",

  description: "",

  discountType: "percentage",

  discountValue: "",

  minimumOrderAmount: "",

  maximumDiscountAmount: "",

  usageLimit: "",

  perCustomerLimit: "",

  startDate: "",

  expiryDate: "",

  audience: "all",

  applicableCustomers: [],

  applicableBranches: [],

  isActive: true,
};

export default function CouponFormDialog({
  open,
  coupon,
  restaurantId,
  branches,
  branchesLoading,
  branchesError,
  customers,
  loading = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<CouponFormData>(
      initialForm
    );

  const isEdit = Boolean(coupon);

  useEffect(() => {
    if (!open) return;

    if (coupon) {
      setForm({
        restaurant:
          typeof coupon.restaurant ===
          "string"
            ? coupon.restaurant
            : coupon.restaurant._id,

        code: coupon.code,

        description:
          coupon.description || "",

        discountType:
          coupon.discountType,

        discountValue:
          String(
            coupon.discountValue
          ),

        minimumOrderAmount:
          String(
            coupon.minimumOrderAmount ||
              ""
          ),

        maximumDiscountAmount:
          coupon.maximumDiscountAmount !==
          undefined
            ? String(
                coupon.maximumDiscountAmount
              )
            : "",

        usageLimit:
          coupon.usageLimit !==
          undefined
            ? String(
                coupon.usageLimit
              )
            : "",

        perCustomerLimit:
          coupon.perCustomerLimit !==
          undefined
            ? String(
                coupon.perCustomerLimit
              )
            : "",

        startDate:
          coupon.startDate
            ? new Date(
                coupon.startDate
              )
                .toISOString()
                .split("T")[0]
            : "",

        expiryDate:
          coupon.expiryDate
            ? new Date(
                coupon.expiryDate
              )
                .toISOString()
                .split("T")[0]
            : "",

        audience:
          coupon
            .applicableCustomers
            ?.length
            ? "specific"
            : "all",

        applicableCustomers:
          coupon
            .applicableCustomers
            ?.map(
              (customer) =>
                customer._id
            ) || [],

        applicableBranches:
          coupon
            .applicableBranches
            ?.map(
              (branch) =>
                branch._id
            ) || [],

        isActive:
          coupon.isActive,
      });
    } else {
      setForm({
        ...initialForm,

        restaurant:
          restaurantId,
      });
    }
  }, [
    open,
    coupon,
    restaurantId,
  ]);

  const update = <
    K extends keyof CouponFormData
  >(
    key: K,
    value: CouponFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const payload: CouponSubmitData = {
      restaurant:
        form.restaurant,

      code: form.code
        .trim()
        .toUpperCase(),

      description:
        form.description.trim(),

      discountType:
        form.discountType,

      discountValue:
        Number(form.discountValue),

      minimumOrderAmount:
        Number(
          form.minimumOrderAmount ||
            0
        ),

      maximumDiscountAmount:
        form.maximumDiscountAmount
          ? Number(
              form.maximumDiscountAmount
            )
          : undefined,

      usageLimit:
        form.usageLimit
          ? Number(form.usageLimit)
          : undefined,

      perCustomerLimit:
        form.perCustomerLimit
          ? Number(
              form.perCustomerLimit
            )
          : undefined,

      startDate:
        form.startDate,

      expiryDate:
        form.expiryDate,

      applicableBranches:
        form.applicableBranches,

      applicableCustomers:
        form.audience === "specific"
          ? form.applicableCustomers
          : [],

      isActive:
        form.isActive,
    };

    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Coupon"
              : "Create Coupon"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the coupon details and discount rules."
              : "Create a new discount coupon for your customers."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="space-y-7"
        >
          {/* BASIC */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Basic
            </h3>

            <div className="space-y-2">
              <Label>
                Coupon Code
                <span className="text-destructive">
                  *
                </span>
              </Label>

              <Input
                value={form.code}
                onChange={(e) =>
                  update(
                    "code",
                    e.target.value
                      .toUpperCase()
                  )
                }
                placeholder="COUPON CODE"
                required
                disabled={isEdit}
              />

              <p className="text-xs text-muted-foreground">
                e.g. SAVE20, WELCOME15
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Description
              </Label>

              <Input
                value={
                  form.description
                }
                onChange={(e) =>
                  update(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Brief description for admin reference"
              />
            </div>
          </section>

          {/* DISCOUNT */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Discount
            </h3>

            <div className="space-y-3">
              <Label>
                Discount Type
                <span className="text-destructive">
                  *
                </span>
              </Label>

              <RadioGroup
                value={
                  form.discountType
                }
                onValueChange={(
                  value
                ) =>
                  update(
                    "discountType",
                    value as
                      | "percentage"
                      | "fixed"
                  )
                }
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="percentage"
                    id="percentage"
                  />

                  <Label htmlFor="percentage">
                    Percentage
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="fixed"
                    id="fixed"
                  />

                  <Label htmlFor="fixed">
                    Fixed Amount
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Value *
                </Label>

                <Input
                  type="number"
                  min="0"
                  max={
                    form.discountType ===
                    "percentage"
                      ? "100"
                      : undefined
                  }
                  step="0.01"
                  value={
                    form.discountValue
                  }
                  onChange={(e) =>
                    update(
                      "discountValue",
                      e.target.value
                    )
                  }
                  placeholder="20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Min Amount (₹) *
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.minimumOrderAmount
                  }
                  onChange={(e) =>
                    update(
                      "minimumOrderAmount",
                      e.target.value
                    )
                  }
                  placeholder="500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Max Discount (₹)
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.maximumDiscountAmount
                  }
                  onChange={(e) =>
                    update(
                      "maximumDiscountAmount",
                      e.target.value
                    )
                  }
                  placeholder="300"
                />
              </div>
            </div>
          </section>

          {/* USAGE LIMITS */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Usage Limits
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Total Usage Limit
                </Label>

                <Input
                  type="number"
                  min="1"
                  value={
                    form.usageLimit
                  }
                  onChange={(e) =>
                    update(
                      "usageLimit",
                      e.target.value
                    )
                  }
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Per Customer Limit
                </Label>

                <Input
                  type="number"
                  min="1"
                  value={
                    form.perCustomerLimit
                  }
                  onChange={(e) =>
                    update(
                      "perCustomerLimit",
                      e.target.value
                    )
                  }
                  placeholder="1"
                />
              </div>
            </div>
          </section>

          {/* AVAILABILITY */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Availability
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Start Date *
                </Label>

                <Input
                  type="date"
                  value={
                    form.startDate
                  }
                  onChange={(e) =>
                    update(
                      "startDate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Expiry Date *
                </Label>

                <Input
                  type="date"
                  value={
                    form.expiryDate
                  }
                  min={
                    form.startDate ||
                    undefined
                  }
                  onChange={(e) =>
                    update(
                      "expiryDate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* AUDIENCE */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Audience
            </h3>

            <RadioGroup
              value={
                form.audience
              }
              onValueChange={(
                value
              ) =>
                update(
                  "audience",
                  value as
                    | "all"
                    | "specific"
                )
              }
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="all"
                  id="all-customers"
                />

                <Label htmlFor="all-customers">
                  All Customers
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="specific"
                  id="specific-customers"
                />

                <Label htmlFor="specific-customers">
                  Specific Customers
                </Label>
              </div>
            </RadioGroup>

            {form.audience ===
              "specific" && (
              <Select
                value={
                  form
                    .applicableCustomers[0] ||
                  ""
                }
                onValueChange={(
                  value
                ) =>
                  update(
                    "applicableCustomers",
                    [value]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>

                <SelectContent>
                  {customers.map(
                    (customer) => (
                      <SelectItem
                        key={
                          customer._id
                        }
                        value={
                          customer._id
                        }
                      >
                        {customer.name}
                        {customer.email
                          ? ` • ${customer.email}`
                          : ""}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          </section>

          {/* BRANCH */}

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Branches
            </h3>

            <Select
              value={
                form
                  .applicableBranches[0] ||
                ""
              }
              onValueChange={(
                value
              ) => {
                const selectedBranch = branches.find(
                  (branch) => branch._id === value
                );

                update("applicableBranches", [value]);

                if (selectedBranch) {
                  update("restaurant", selectedBranch.restaurantId);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    branchesLoading
                      ? "Loading branches..."
                      : "Select branch"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {branchesLoading ? (
                  <SelectItem value="__loading" disabled>
                    Loading branches...
                  </SelectItem>
                ) : branches.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    No branches available
                  </SelectItem>
                ) : branches.map(
                  (branch) => (
                    <SelectItem
                      key={branch._id}
                      value={
                        branch._id
                      }
                    >
                      {branch.name} — {branch.restaurantName}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              {branchesError ||
                "Choose a branch to associate this coupon with its restaurant. Leave the selection empty to apply it to all branches of that restaurant."}
            </p>
            {!form.restaurant && (
              <p className="text-sm text-destructive">
                Select a branch or choose a restaurant before creating the coupon.
              </p>
            )}
          </section>

          <DialogFooter className="gap-2 border-t pt-5">
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
              disabled={loading || !form.restaurant}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEdit
                ? "Continue"
                : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}