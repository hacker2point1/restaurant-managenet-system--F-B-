"use client";

import {
  AlertTriangle,
  Loader2,
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

interface BranchConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;

  destructive?: boolean;

  onConfirm: () => void;
}

export function BranchConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  destructive = false,
  onConfirm,
}: BranchConfirmationDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
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
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}