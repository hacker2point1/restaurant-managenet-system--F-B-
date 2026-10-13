"use client";

import {
  Search,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  branches: {
    _id: string;
    name: string;
    restaurantName: string;
  }[];

  branchId: string;

  branchesLoading: boolean;

  onBranchChange: (branchId: string) => void;

  search: string;

  setSearch: (
    value: string
  ) => void;

  status: string;

  setStatus: (
    value: string
  ) => void;

  unit: string;

  setUnit: (
    value: string
  ) => void;

  total: number;
}

export default function InventoryFilters({
  branches,
  branchId,
  branchesLoading,
  onBranchChange,
  search,
  setSearch,
  status,
  setStatus,
  unit,
  setUnit,
  total,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">

      <div className="flex flex-wrap items-center gap-3 border-b p-4">

        <select
          value={branchId}
          onChange={(event) => onBranchChange(event.target.value)}
          disabled={branchesLoading}
          aria-label="Filter inventory by branch"
          className="h-10 min-w-[210px] rounded-md border bg-background px-3 text-sm disabled:opacity-60"
        >
          <option value="all">All branches</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.restaurantName} · {branch.name}
            </option>
          ))}
        </select>

        <div className="relative w-full md:w-[300px]">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search ingredient, SKU..."
            className="pl-9"
          />

        </div>

        <Select
          value={status}
          onValueChange={
            setStatus
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Status
            </SelectItem>

            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="inactive">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={unit}
          onValueChange={
            setUnit
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Units" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Units
            </SelectItem>

            <SelectItem value="kg">
              kg
            </SelectItem>

            <SelectItem value="gram">
              gram
            </SelectItem>

            <SelectItem value="liter">
              liter
            </SelectItem>

            <SelectItem value="ml">
              ml
            </SelectItem>

            <SelectItem value="piece">
              piece
            </SelectItem>

            <SelectItem value="packet">
              packet
            </SelectItem>

            <SelectItem value="box">
              box
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          {total} items
        </div>

      </div>

    </div>
  );
}