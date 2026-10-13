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

interface BranchFiltersProps {
  search: string;
  status: string;
  city: string;

  cities: string[];

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCityChange: (value: string) => void;

  onClear: () => void;
}

export function BranchFilters({
  search,
  status,
  city,
  cities,
  onSearchChange,
  onStatusChange,
  onCityChange,
  onClear,
}: BranchFiltersProps) {
  const hasFilters =
    search ||
    status !== "all" ||
    city !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-[365px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search branch, city, manager..."
          className="h-11 pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="h-11 w-[175px]">
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
        value={city}
        onValueChange={onCityChange}
      >
        <SelectTrigger className="h-11 w-[175px]">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Cities
          </SelectItem>

          {cities.map((item) => (
            <SelectItem
              key={item}
              value={item}
            >
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="h-11"
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}