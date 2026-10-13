"use client";

import { ArrowDownAZ, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RestaurantFiltersProps {
  cuisines: string[];
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  sort: "newest" | "name";
  onSortChange: (sort: "newest" | "name") => void;
  total: number;
}

export default function RestaurantFilters({
  cuisines,
  selectedCuisine,
  onCuisineChange,
  sort,
  onSortChange,
  total,
}: RestaurantFiltersProps) {
  const visibleCuisines = cuisines.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => onCuisineChange("")}
            variant={selectedCuisine === "" ? "default" : "outline"}
            className={
              selectedCuisine === ""
                ? "rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                : "rounded-xl border-slate-200 bg-white text-slate-600"
            }
          >
            All
          </Button>

          {visibleCuisines.map((cuisine) => (
            <Button
              key={cuisine}
              type="button"
              onClick={() =>
                onCuisineChange(
                  selectedCuisine === cuisine ? "" : cuisine
                )
              }
              variant={
                selectedCuisine === cuisine ? "default" : "outline"
              }
              className={
                selectedCuisine === cuisine
                  ? "rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                  : "rounded-xl border-slate-200 bg-white text-slate-600"
              }
            >
              {cuisine}
            </Button>
          ))}
        </div>

        <label className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 lg:self-auto">
          <SlidersHorizontal className="h-4 w-4 text-violet-600" />
          <span>Sort</span>

          <select
            aria-label="Sort restaurants"
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as "newest" | "name")
            }
            className="max-w-36 cursor-pointer bg-transparent font-medium text-slate-800 outline-none"
          >
            <option value="newest">Recently added</option>
            <option value="name">Name A–Z</option>
          </select>

          <ArrowDownAZ className="h-4 w-4" />
        </label>
      </div>

      <p className="text-sm text-slate-500">
        <strong className="text-slate-900">
          {total.toLocaleString("en-IN")} restaurants
        </strong>{" "}
        available
      </p>
    </div>
  );
}