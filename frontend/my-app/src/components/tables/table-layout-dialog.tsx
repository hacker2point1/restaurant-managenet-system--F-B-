"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Button,
} from "@/components/ui/button";

interface TableLayoutDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  columns: number;

  onColumnsChange: (columns: number) => void;
}

export default function TableLayoutDialog({
  open,
  onOpenChange,
  columns,
  onColumnsChange,
}: TableLayoutDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            Configure layout
          </DialogTitle>

          <DialogDescription>
            Choose how many table cards should
            appear in each row.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={
                columns === value
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                onColumnsChange(value)
              }
              className={
                columns === value
                  ? "bg-[#95682f] hover:bg-[#825a28]"
                  : ""
              }
            >
              {value}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={() =>
              onOpenChange(false)
            }
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}