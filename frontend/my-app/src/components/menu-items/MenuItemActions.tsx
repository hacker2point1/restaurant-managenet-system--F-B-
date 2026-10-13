"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { MenuItem } from "@/types/menuItem";

import MenuItemFormDialog from "./MenuItemFormDialog";
import DeleteMenuItemDialog from "./DeleteMenuItemDialog";

interface Props {
  item: MenuItem;
}

export default function MenuItemActions({
  item,
}: Props) {
  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setEditOpen(true)
          }
        >
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() =>
            setDeleteOpen(true)
          }
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>

      {editOpen && (
        <MenuItemFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          item={item}
        />
      )}

      <DeleteMenuItemDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={item}
      />
    </>
  );
}