"use client";

import { UtensilsCrossed } from "lucide-react";

export default function MenuItemEmptyState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f1e7]">
        <UtensilsCrossed className="h-6 w-6 text-[#94672d]" />
      </div>

      <h3 className="text-lg font-semibold">
        No menu items yet
      </h3>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Start building your menu by
        creating your first menu item.
      </p>
    </div>
  );
}