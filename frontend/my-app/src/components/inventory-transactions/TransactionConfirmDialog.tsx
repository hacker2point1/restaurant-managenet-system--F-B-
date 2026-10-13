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

  confirmLabel: string;

  loading?: boolean;

  destructive?: boolean;

  onOpenChange: (open: boolean) => void;

  onConfirm: () => void;
}

export default function TransactionConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  destructive = false,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
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
              : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}