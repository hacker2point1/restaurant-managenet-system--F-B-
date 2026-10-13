"use client";

import {
  Search,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

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


interface UserFiltersProps {
  search: string;

  role: string;

  status: string;

  onSearchChange: (
    value: string
  ) => void;

  onRoleChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onClear: () => void;
}


export default function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}: UserFiltersProps) {

  const hasFilters =
    Boolean(search) ||
    role !== "all" ||
    status !== "all";


  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">

      {/* SEARCH */}

      <div className="relative min-w-0 flex-1 lg:max-w-[420px]">

        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value
            )
          }
          placeholder="Search users..."
          className="h-10 rounded-lg border-slate-200 bg-white pl-10 shadow-none"
        />

      </div>


      {/* ROLE */}

      <Select
        value={role}
        onValueChange={
          onRoleChange
        }
      >

        <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 lg:w-[170px]">

          <SelectValue placeholder="All Roles" />

        </SelectTrigger>

        <SelectContent>

          <SelectItem value="all">
            All Roles
          </SelectItem>

          <SelectItem value="admin">
            Admin
          </SelectItem>

          <SelectItem value="manager">
            Manager
          </SelectItem>

          <SelectItem value="staff">
            Staff
          </SelectItem>

          <SelectItem value="customer">
            Customer
          </SelectItem>

        </SelectContent>

      </Select>


      {/* STATUS */}

      <Select
        value={status}
        onValueChange={
          onStatusChange
        }
      >

        <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 lg:w-[170px]">

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


      {hasFilters && (

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-10 gap-2 text-slate-500"
        >

          <X className="h-4 w-4" />

          Clear filters

        </Button>

      )}

    </div>
  );
}