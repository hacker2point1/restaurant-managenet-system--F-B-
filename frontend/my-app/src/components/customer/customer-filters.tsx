
"use client";

import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  search: string;
  status: string;
  recycleBin: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRecycleBin: () => void;
}

export function CustomerFilters({
  search, status, recycleBin, onSearchChange,
  onStatusChange, onRecycleBin,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={recycleBin
            ? "Search deleted customers..."
            : "Search by name, email, phone..."}
          className="pl-9"
        />
      </div>

      {!recycleBin && (
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Button
        type="button"
        variant={recycleBin ? "default" : "outline"}
        onClick={onRecycleBin}
        className={recycleBin
          ? "bg-[#8B642F] hover:bg-[#765326]"
          : ""}
      >
        <Trash2 className="mr-2 size-4" />
        {recycleBin ? "Back to customers" : "Recycle Bin"}
      </Button>
    </div>
  );
}
