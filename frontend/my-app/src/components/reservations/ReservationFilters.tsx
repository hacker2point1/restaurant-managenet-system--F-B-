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

interface Props {
  search: string;

  status: string;

  branchId: string;

  date: string;

  branches: {
    _id: string;
    name: string;
  }[];

  onSearchChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onBranchChange: (
    value: string
  ) => void;

  onDateChange: (
    value: string
  ) => void;

  onClear: () => void;
}

export default function ReservationFilters({
  search,
  status,
  branchId,
  date,
  branches,
  onSearchChange,
  onStatusChange,
  onBranchChange,
  onDateChange,
  onClear,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b p-4">
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search customer, ID..."
          className="pl-9"
        />
      </div>

      <Select
        value={status || "all"}
        onValueChange={(value) =>
          onStatusChange(
            value === "all" ? "" : value
          )
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Status
          </SelectItem>

          <SelectItem value="confirmed">
            Confirmed
          </SelectItem>

          <SelectItem value="pending">
            Pending
          </SelectItem>

          <SelectItem value="completed">
            Completed
          </SelectItem>

          <SelectItem value="cancelled">
            Cancelled
          </SelectItem>

          <SelectItem value="no-show">
            No-show
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={branchId || "all"}
        onValueChange={(value) =>
          onBranchChange(
            value === "all" ? "" : value
          )
        }
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Branches
          </SelectItem>

          {branches.map((branch) => (
            <SelectItem
              key={branch._id}
              value={branch._id}
            >
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={date}
        onChange={(e) =>
          onDateChange(e.target.value)
        }
        className="w-[150px]"
      />

      {(search || status || branchId || date) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          title="Clear filters"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}