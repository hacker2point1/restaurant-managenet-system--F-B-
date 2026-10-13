"use client";

import {
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  search: string;

  status: string;

  type: string;

  audience: string;

  onSearchChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onTypeChange: (
    value: string
  ) => void;

  onAudienceChange: (
    value: string
  ) => void;

  onReset: () => void;
}

export default function CouponFilters({
  search,
  status,
  type,
  audience,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onAudienceChange,
  onReset,
}: Props) {
  const hasFilters =
    search ||
    status !== "all" ||
    type !== "all" ||
    audience !== "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) =>
            onSearchChange(
              e.target.value
            )
          }
          placeholder="Search coupon code..."
          className="h-10 pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={
          onStatusChange
        }
      >
        <SelectTrigger className="h-10 w-full lg:w-[140px]">
          <SelectValue />
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
        value={type}
        onValueChange={
          onTypeChange
        }
      >
        <SelectTrigger className="h-10 w-full lg:w-[150px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Types
          </SelectItem>

          <SelectItem value="percentage">
            Percentage
          </SelectItem>

          <SelectItem value="fixed">
            Fixed Amount
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={audience}
        onValueChange={
          onAudienceChange
        }
      >
        <SelectTrigger className="h-10 w-full lg:w-[170px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Audience
          </SelectItem>

          <SelectItem value="all-customers">
            All Customers
          </SelectItem>

          <SelectItem value="specific">
            Specific Customers
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}