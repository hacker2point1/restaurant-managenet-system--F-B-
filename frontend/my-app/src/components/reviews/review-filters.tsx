"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  rating: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRatingChange: (value: string) => void;
}

export function ReviewFilters({
  search,
  status,
  rating,
  onSearchChange,
  onStatusChange,
  onRatingChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1 md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search reviews..."
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={rating} onValueChange={onRatingChange}>
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="All ratings" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          {[5, 4, 3, 2, 1].map((value) => (
            <SelectItem key={value} value={String(value)}>
              {value} Star{value > 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}