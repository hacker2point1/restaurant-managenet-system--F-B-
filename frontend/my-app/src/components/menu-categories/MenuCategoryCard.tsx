"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import MenuCategoryStatusBadge from "./MenuCategoryStatusBadge";
import MenuCategoryActions from "./MenuCategoryActions";

import {
  MenuCategory,
} from "@/types/menuCategory";

interface Props {
  category: MenuCategory;

  onView: (category: MenuCategory) => void;

  onEdit: (category: MenuCategory) => void;

  onActivate: (category: MenuCategory) => void;

  onDeactivate: (category: MenuCategory) => void;

  onDelete: (category: MenuCategory) => void;
}

export default function MenuCategoryCard({
  category,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: Props) {
  const initials = category.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="group rounded-xl border-slate-200 bg-white shadow-none transition-all hover:border-slate-300 hover:shadow-sm">
      <CardContent className="p-4">
        {/* TOP */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {category.image?.url ? (
              <img
                src={category.image.url}
                alt={category.name}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8f2e9] text-sm font-semibold text-[#8b632f]">
                {initials}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              #{String(category.displayOrder).padStart(2, "0")}
            </span>

            <MenuCategoryStatusBadge
              isActive={category.isActive}
            />

            <MenuCategoryActions
              category={category}
              onView={onView}
              onEdit={onEdit}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5">
          <h3 className="text-[17px] font-semibold text-slate-900">
            {category.name}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-slate-500">
            {category.description ||
              "No description available"}
          </p>
        </div>

        {/* DIVIDER */}
        <div className="my-5 border-t border-slate-100" />

        {/* STATS */}
        <div className="flex items-end justify-between">
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-slate-400">
                Items
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {category.menuItemCount ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Available
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {category.menuItemCount ?? 0}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="h-8 px-2 text-sm font-medium text-slate-600 hover:bg-transparent hover:text-[#8b632f]"
            onClick={() => onView(category)}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}