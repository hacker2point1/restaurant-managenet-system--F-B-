"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Branch } from "@/types/branch";

interface BranchActionsProps {
  branch: Branch;

  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;

  onActivate: (branch: Branch) => void;
  onDeactivate: (branch: Branch) => void;

  onDelete: (branch: Branch) => void;
}

export function BranchActions({
  branch,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: BranchActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${branch.name}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44"
      >
        <DropdownMenuItem
          onClick={() => onView(branch)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onEdit(branch)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {branch.isActive ? (
          <DropdownMenuItem
            onClick={() => onDeactivate(branch)}
          >
            <PowerOff className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onActivate(branch)}
          >
            <Power className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(branch)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}