"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

import {
  Switch,
} from "@/components/ui/switch";

import {
  Table,
  TableLocation,
} from "@/types/table";

interface BranchOption {
  _id: string;
  name: string;
  branchCode?: string;
}

interface RestaurantOption {
  _id: string;
  name: string;
}

const tableFormSchema = yup.object({
  branchId: yup.string().required("Select a branch."),
  tableNumber: yup
    .string()
    .trim()
    .required("Table number is required."),
  capacity: yup
    .number()
    .typeError("Capacity must be a number.")
    .integer("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1.")
    .required("Capacity is required."),
  location: yup
    .mixed<TableLocation>()
    .oneOf(["indoor", "outdoor", "rooftop", "private", "bar"])
    .required("Select a location."),
  isActive: yup.boolean().required(),
});

type TableFormValues = yup.InferType<typeof tableFormSchema>;

interface TableFormDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  table?: Table | null;

  restaurants: RestaurantOption[];

  selectedRestaurantId: string;

  onRestaurantChange: (restaurantId: string) => void | Promise<void>;

  branches: BranchOption[];

  branchesLoading: boolean;

  selectedBranchId: string;

  loading?: boolean;

  onSubmit: (data: TableFormValues) => void | Promise<void>;
}

export default function TableFormDialog({
  open,
  onOpenChange,
  table,
  restaurants,
  selectedRestaurantId,
  onRestaurantChange,
  branches,
  branchesLoading,
  selectedBranchId,
  loading = false,
  onSubmit,
}: TableFormDialogProps) {
  const isEdit = Boolean(table);
  const form = useForm<TableFormValues>({
    resolver: yupResolver(tableFormSchema),
    defaultValues: {
      branchId: selectedBranchId === "all" ? "" : selectedBranchId,
      tableNumber: "",
      capacity: 2,
      location: "indoor",
      isActive: true,
    },
  });
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;
    wasOpen.current = true;

    if (table) {
      form.reset({
        branchId: typeof table.branch === "string" ? table.branch : table.branch._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        isActive: table.isActive,
      });
    } else {
      form.reset({
        branchId: selectedBranchId === "all" ? "" : selectedBranchId,
        tableNumber: "",
        capacity: 2,
        location: "indoor",
        isActive: true,
      });
    }
  }, [form, open, selectedBranchId, table]);

  const errors = form.formState.errors;
  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant._id === selectedRestaurantId
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit table" : "Add table"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the table information."
              : "Choose a restaurant and branch for this table."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant</Label>
                <Select
                  value={selectedRestaurantId}
                  onValueChange={(restaurantId) => {
                    form.setValue("branchId", "");
                    form.clearErrors("branchId");
                    void onRestaurantChange(restaurantId ?? "all");
                  }}
                >
                  <SelectTrigger id="restaurantId">
                    <SelectValue placeholder="Select a restaurant">
                      {selectedRestaurant?.name ??
                        (selectedRestaurantId === "all"
                          ? "Select a restaurant"
                          : undefined)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select a restaurant</SelectItem>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <Controller
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={selectedRestaurantId === "all" || branchesLoading}
                    >
                      <SelectTrigger id="branchId" aria-invalid={Boolean(errors.branchId)}>
                        <SelectValue placeholder="Select a branch">
                          {branches.find((branch) => branch._id === field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {branches.length > 0 ? branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            {branch.name}{branch.branchCode ? ` (${branch.branchCode})` : ""}
                          </SelectItem>
                        )) : (
                          <SelectItem value="no-branches" disabled>
                            {branchesLoading ? "Loading branches..." : "No branches available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {selectedRestaurantId !== "all" && !branchesLoading && branches.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No branches available. Create a branch before adding a table.
                  </p>
                )}
                {errors.branchId && <p role="alert" className="text-sm text-destructive">{errors.branchId.message}</p>}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="tableNumber">Table number</Label>
            <Input
              id="tableNumber"
              placeholder="T-01"
              aria-invalid={Boolean(errors.tableNumber)}
              {...form.register("tableNumber")}
            />
            {errors.tableNumber && <p role="alert" className="text-sm text-destructive">{errors.tableNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              step={1}
              aria-invalid={Boolean(errors.capacity)}
              {...form.register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity && <p role="alert" className="text-sm text-destructive">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Controller
              control={form.control}
              name="location"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="location" aria-invalid={Boolean(errors.location)}>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="rooftop">Rooftop</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location && <p role="alert" className="text-sm text-destructive">{errors.location.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Active table</p>
              <p className="text-xs text-muted-foreground">
                Allow this table to be used.
              </p>
            </div>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                form.formState.isSubmitting ||
                (!isEdit && (selectedRestaurantId === "all" || branchesLoading || branches.length === 0))
              }
              className="bg-[#95682f] hover:bg-[#825a28]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update table" : "Create table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}