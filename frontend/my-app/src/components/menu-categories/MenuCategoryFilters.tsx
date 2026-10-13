"use client";

import {
  Search,
  X,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

interface RestaurantOption {
  _id: string;
  name: string;
}

interface BranchOption {
  _id: string;
  name: string;
}

interface Props {
  search: string;

  onSearchChange: (
    value: string
  ) => void;

  status: string;

  onStatusChange: (
    value: string
  ) => void;

  total: number;
  restaurants: RestaurantOption[];
  selectedRestaurantId: string;
  onRestaurantChange: (value: string) => void;
  selectedBranchId: string;
  onBranchChange: (value: string) => void;
  branchOptions: BranchOption[];
  branchLoading: boolean;
}

export default function MenuCategoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  total,
  restaurants,
  selectedRestaurantId,
  onRestaurantChange,
  selectedBranchId,
  onBranchChange,
  branchOptions,
  branchLoading,
}: Props) {
  return (
    <div className="border-b border-slate-100 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative max-w-[320px] flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              placeholder="Search categories..."
              className="pl-9"
            />
          </div>

          <select
            value={selectedRestaurantId || ""}
            onChange={(e) =>
              onRestaurantChange(e.target.value)
            }
            className="h-10 min-w-[200px] rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="" disabled>
              Select restaurant
            </option>

            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBranchId}
            onChange={(e) =>
              onBranchChange(e.target.value)
            }
            disabled={branchLoading || !selectedRestaurantId}
            className="h-10 min-w-[200px] rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="all">
              {!selectedRestaurantId ? "Select restaurant first" : "All branches"}
            </option>

            {branchOptions.length === 0 && selectedRestaurantId && (
              <option value="" disabled>
                {branchLoading ? "Loading branches..." : "No branches available"}
              </option>
            )}

            {branchOptions.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">
              All status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Draft
            </option>
          </select>

          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm text-slate-500">
          {total} categories
        </p>
      </div>
    </div>
  );
}