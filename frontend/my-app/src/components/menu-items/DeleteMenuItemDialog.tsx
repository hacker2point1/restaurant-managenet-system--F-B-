"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  deleteMenuItem,
} from "@/redux/slice/menuItemSlice";

import type {
  AppDispatch,
} from "@/redux/store/store";

import type {
  MenuItem,
} from "@/types/menuItem";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
}

export default function DeleteMenuItemDialog({
  open,
  onOpenChange,
  item,
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  const [loading, setLoading] =
    useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await dispatch(
        deleteMenuItem(item._id)
      ).unwrap();

      onOpenChange(false);
    } catch {
      // The thunk already reports API failures through the Redux slice.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>

          <DialogTitle>
            Delete menu item?
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{item.name}</strong>?
            This action will remove it from
            the active menu.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading
              ? "Deleting..."
              : "Delete Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}