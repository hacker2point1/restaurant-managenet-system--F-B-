"use client";

import {
  Store,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface RestaurantEmptyStateProps {
  onCreate: () => void;
}

export default function RestaurantEmptyState({
  onCreate,
}: RestaurantEmptyStateProps) {

  return (
    <div
      className="
        flex
        min-h-[400px]
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        bg-white
        p-8
        text-center
      "
    >

      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-[#f5eee5]
        "
      >
        <Store
          size={28}
          className="text-[#9b6b2f]"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        No restaurants found
      </h3>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        Create your first restaurant to start
        managing branches, menus, tables and
        operations.
      </p>

      <Button
        onClick={onCreate}
        className="mt-5 bg-[#9b6b2f] hover:bg-[#825823]"
      >
        <Plus className="mr-2 h-4 w-4" />

        Add restaurant
      </Button>

    </div>
  );
}