"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Branch } from "@/types/branch";

interface BranchViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  branch: Branch | null;
  loading?: boolean;
}

export function BranchViewDialog({
  open,
  onOpenChange,
  branch,
  loading,
}: BranchViewDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Branch Details
          </DialogTitle>
        </DialogHeader>

        {loading || !branch ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-lg font-semibold text-white">
                {branch.name
                  .split(" ")
                  .map((item) => item[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {branch.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {branch.branchCode}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  City
                </p>

                <p className="mt-1">
                  {branch.address?.city || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  State
                </p>

                <p className="mt-1">
                  {branch.address?.state || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Phone
                </p>

                <p className="mt-1">
                  {branch.contact?.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Email
                </p>

                <p className="mt-1">
                  {branch.contact?.email || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Address
                </p>

                <p className="mt-1">
                  {[
                    branch.address?.street,
                    branch.address?.city,
                    branch.address?.state,
                    branch.address?.country,
                    branch.address?.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}