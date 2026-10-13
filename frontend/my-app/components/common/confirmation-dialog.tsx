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


interface ConfirmationDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  title: string;

  description: string;

  confirmText?: string;

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
  loading = false,
  destructive = false,
  onConfirm,
}: ConfirmationDialogProps) {

  return (
    <AlertDialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >

      <AlertDialogContent className="max-w-[430px] rounded-2xl">

        <AlertDialogHeader>

          <div
            className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full ${
              destructive
                ? "bg-red-50"
                : "bg-amber-50"
            }`}
          >

            <AlertTriangle
              className={`h-5 w-5 ${
                destructive
                  ? "text-red-600"
                  : "text-amber-600"
              }`}
            />

          </div>

          <AlertDialogTitle className="text-lg">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="leading-6">
            {description}
          </AlertDialogDescription>

        </AlertDialogHeader>


        <AlertDialogFooter className="mt-4">

          <AlertDialogCancel
            disabled={loading}
          >
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
                ? "bg-red-600 text-white hover:bg-red-700"
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