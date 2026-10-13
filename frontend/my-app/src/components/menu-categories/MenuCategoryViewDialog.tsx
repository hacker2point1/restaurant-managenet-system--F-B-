"use client";

import {
  CalendarDays,
  Hash,
  Package,
  Store,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Separator,
} from "@/components/ui/separator";

import {
  MenuCategory,
} from "@/types/menuCategory";

import MenuCategoryStatusBadge from "./MenuCategoryStatusBadge";

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  category: MenuCategory | null;

  loading?: boolean;
}

export default function MenuCategoryViewDialog({
  open,
  onOpenChange,
  category,
  loading = false,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Category details
          </DialogTitle>

          <DialogDescription>
            View menu category information.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading category...
          </div>
        ) : category ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#f8f2e9] text-lg font-semibold text-[#8b632f]">
                  {category.name
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold">
                  {category.name}
                </h3>

                <div className="mt-2">
                  <MenuCategoryStatusBadge
                    isActive={category.isActive}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {category.description ||
                  "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Hash className="h-4 w-4" />
                  <span className="text-xs">
                    Display order
                  </span>
                </div>

                <p className="mt-2 font-semibold">
                  {category.displayOrder}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">
                    Menu items
                  </span>
                </div>

                <p className="mt-2 font-semibold">
                  {category.menuItemCount ?? 0}
                </p>
              </div>
            </div>

            {typeof category.branch === "object" && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Store className="h-4 w-4" />
                  <span className="text-xs">
                    Branch
                  </span>
                </div>

                <p className="mt-2 font-medium">
                  {category.branch.name}
                </p>
              </div>
            )}

            {category.createdAt && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays className="h-4 w-4" />

                Created{" "}
                {new Date(
                  category.createdAt
                ).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}