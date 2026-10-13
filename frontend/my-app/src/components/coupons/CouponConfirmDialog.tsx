"use client";

import {
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;

  title: string;

  description: string;

  confirmText: string;

  destructive?: boolean;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}

export default function CouponConfirmDialog({
  open,
  title,
  description,
  confirmText,
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>

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
            onClick={onCancel}
          >
            Cancel
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
            {loading
              ? "Processing..."
              : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}