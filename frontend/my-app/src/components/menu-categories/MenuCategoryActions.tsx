"use client";

import {
  Eye,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MenuCategory,
} from "@/types/menuCategory";

interface Props {
  category: MenuCategory;

  onView: (category: MenuCategory) => void;

  onEdit: (category: MenuCategory) => void;

  onActivate: (category: MenuCategory) => void;

  onDeactivate: (category: MenuCategory) => void;

  onDelete: (category: MenuCategory) => void;
}

export default function MenuCategoryActions({
  category,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44"
      >
        <DropdownMenuItem
          onClick={() => onView(category)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onEdit(category)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {category.isActive ? (
          <DropdownMenuItem
            onClick={() =>
              onDeactivate(category)
            }
          >
            <PowerOff className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() =>
              onActivate(category)
            }
          >
            <Power className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}