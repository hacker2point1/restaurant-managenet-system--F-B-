"use client";

import {
  AlertTriangle,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  title: string;

  description: string;

  confirmText: string;

  destructive?: boolean;

  loading?: boolean;

  onConfirm: () => void;
}

export default function MenuCategoryConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  destructive = false,
  loading = false,
  onConfirm,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="sm:max-w-[430px]">
        <AlertDialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>

          <AlertDialogTitle>
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : ""
            }
          >
            {loading ? "Please wait..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}