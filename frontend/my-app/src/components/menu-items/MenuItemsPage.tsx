"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  getMenuItems,
  searchMenuItems,
  restoreMenuItem,
  toggleMenuItemAvailability,
  toggleMenuItemFeatured,
} from "@/redux/slice/menuItemSlice";

import type { RootState, AppDispatch } from "@/redux/store/store";
import type { FoodType, MenuItem } from "@/types/menuItem";
import MenuItemsTable from "./MenuItemsTable";
import MenuItemFormDialog from "./MenuItemFormDialog";
import DeleteMenuItemDialog from "./DeleteMenuItemDialog";

// import MenuItemsTable from "./MenuItemsTable";
// import MenuItemFormDialog from "./MenuItemFormDialog";

export default function MenuItemsPage() {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    items,
    total,
    loading,
    totalPages,
  } = useSelector(
    (state: RootState) =>
      state.menuItems
  );

  /*
   * Connect these two values to your
   * existing branch selector.
   *
   * For now:
   *
   * undefined = All Branches
   */
  const selectedBranchId:
    | string
    | undefined = undefined;

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [foodType, setFoodType] =
    useState("all");

  const [availability, setAvailability] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [openCreate, setOpenCreate] =
    useState(false);
  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<MenuItem | null>(null);
  const [viewingItem, setViewingItem] =
    useState<MenuItem | null>(null);

  const filteredParams = useMemo(
    () => ({
      page,
      limit: 10,

      branchId:
        selectedBranchId,

      category:
        category !== "all"
          ? category
          : undefined,

      foodType:
        foodType !== "all"
            ? (foodType as FoodType)
          : undefined,

      isAvailable:
        availability === "all"
          ? undefined
          : availability === "available",
    }),
    [
      page,
      selectedBranchId,
      category,
      foodType,
      availability,
    ]
  );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        if (search.trim()) {
          dispatch(
            searchMenuItems({
              search,
              branchId:
                selectedBranchId,
              page,
              limit: 10,
            })
          );
        } else {
          dispatch(
            getMenuItems(
              filteredParams
            )
          );
        }
      }, 400);

    return () =>
      clearTimeout(timer);
  }, [
    dispatch,
    search,
    selectedBranchId,
    page,
    filteredParams,
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Menu Items
          </h1>

          <p className="text-sm text-muted-foreground">
            {total} items
          </p>
        </div>

        <Button
          onClick={() =>
            setOpenCreate(true)
          }
          className="bg-[#94672d] hover:bg-[#7e5726]"
        >
          + Add Item
        </Button>
      </div>

      {/* FILTER CARD */}

      <div className="rounded-xl border bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search menu items..."
              className="pl-9"
            />
          </div>

          {/* Category */}

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All Categories
            </option>
          </select>

          {/* Food type */}

          <select
            value={foodType}
            onChange={(e) => {
              setFoodType(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All Types
            </option>

            <option value="vegetarian">
              Vegetarian
            </option>

            <option value="non-vegetarian">
              Non-Veg
            </option>

            <option value="vegan">
              Vegan
            </option>
          </select>

          {/* Availability */}

          <select
            value={availability}
            onChange={(e) => {
              setAvailability(
                e.target.value
              );

              setPage(1);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All Availability
            </option>

            <option value="available">
              Available
            </option>

            <option value="unavailable">
              Unavailable
            </option>
          </select>
        </div>

        <MenuItemsTable
          items={items}
          loading={loading}
          onView={setViewingItem}
          onEdit={setEditingItem}
          onDelete={setDeleteTarget}
          onRestore={(item) => {
            dispatch(restoreMenuItem(item._id));
          }}
          onToggleAvailability={(item) => {
            dispatch(toggleMenuItemAvailability(item._id));
          }}
          onToggleFeatured={(item) => {
            dispatch(toggleMenuItemFeatured(item._id));
          }}
        />

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {items.length} of{" "}
              {total}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    (p) => p - 1
                  )
                }
              >
                ← Prev
              </Button>

              <Button
                variant="outline"
              >
                {page}
              </Button>

              <Button
                variant="outline"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (p) => p + 1
                  )
                }
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {openCreate && (
        <MenuItemFormDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          mode="create"
        />
      )}

      {editingItem && (
        <MenuItemFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditingItem(null);
          }}
          mode="edit"
          item={editingItem}
          onSaved={() => {
            if (search.trim()) {
              dispatch(
                searchMenuItems({
                  search,
                  branchId: selectedBranchId,
                  page,
                  limit: 10,
                })
              );
            } else {
              dispatch(getMenuItems(filteredParams));
            }
          }}
        />
      )}

      {deleteTarget && (
        <DeleteMenuItemDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          item={deleteTarget}
        />
      )}

      <Dialog
        open={!!viewingItem}
        onOpenChange={(open) => {
          if (!open) setViewingItem(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          {viewingItem && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingItem.name}</DialogTitle>
                <DialogDescription>
                  {viewingItem.description || "No description available."}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="mt-1 font-medium">₹{viewingItem.price}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-1 font-medium">
                    {typeof viewingItem.category === "string"
                      ? viewingItem.category
                      : viewingItem.category?.name || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Food type</dt>
                  <dd className="mt-1 font-medium">{viewingItem.foodType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Preparation time</dt>
                  <dd className="mt-1 font-medium">
                    {viewingItem.preparationTime
                      ? `${viewingItem.preparationTime} minutes`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Availability</dt>
                  <dd className="mt-1 font-medium">
                    {viewingItem.isAvailable ? "Available" : "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Featured</dt>
                  <dd className="mt-1 font-medium">
                    {viewingItem.isFeatured ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Ingredients</dt>
                  <dd className="mt-1 font-medium">
                    {viewingItem.ingredients
                      .map((ingredient) =>
                        typeof ingredient === "string"
                          ? ingredient
                          : ingredient.name
                      )
                      .join(", ") || "-"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Tags</dt>
                  <dd className="mt-1 font-medium">
                    {viewingItem.tags.join(", ") || "-"}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}