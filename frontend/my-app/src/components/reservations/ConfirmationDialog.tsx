"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
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

export default function ConfirmationDialog({
  open,

  onOpenChange,

  title,

  description,

  confirmText = "Confirm",

  cancelText = "Cancel",

  loading = false,

  destructive = false,

  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              onOpenChange(false)
            }
          >
            {cancelText}
          </Button>

          <Button
            variant={
              destructive
                ? "destructive"
                : "default"
            }
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}