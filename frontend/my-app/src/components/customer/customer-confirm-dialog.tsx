
"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  loading?: boolean;
  title: string;
  description: string;
  confirmText: string;
  destructive?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CustomerConfirmDialog({
  open, loading = false, title, description, confirmText,
  destructive = false, onOpenChange, onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
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
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-[#8B642F] text-white hover:bg-[#765326]"
            }
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Please wait..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
