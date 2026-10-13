"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import type {
  InventoryTransactionType,
} from "@/types/inventoryTransaction";

interface Branch {
  _id: string;
  name: string;
}

interface Props {
  search: string;
  setSearch: (value: string) => void;

  type: string;
  setType: (value: string) => void;

  branch: string;
  setBranch: (value: string) => void;

  branches: Branch[];

  onReset: () => void;
}

export default function InventoryTransactionFilters({
  search,
  setSearch,
  type,
  setType,
  branch,
  setBranch,
  branches,
  onReset,
}: Props) {
  const hasFilters =
    search ||
    type !== "all" ||
    branch !== "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search item, ID, SKU..."
          className="h-10 pl-9"
        />
      </div>

      <Select
        value={type}
        onValueChange={setType}
      >
        <SelectTrigger className="h-10 w-full lg:w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Types
          </SelectItem>

          <SelectItem value="purchase">
            Purchase
          </SelectItem>

          <SelectItem value="stock-in">
            Stock In
          </SelectItem>

          <SelectItem value="stock-out">
            Usage
          </SelectItem>

          <SelectItem value="wastage">
            Waste
          </SelectItem>

          <SelectItem value="return">
            Return
          </SelectItem>

          <SelectItem value="adjustment">
            Adjustment
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={branch}
        onValueChange={setBranch}
      >
        <SelectTrigger className="h-10 w-full lg:w-[190px]">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Branches
          </SelectItem>

          {branches.map((item) => (
            <SelectItem
              key={item._id}
              value={item._id}
            >
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          title="Clear filters"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}