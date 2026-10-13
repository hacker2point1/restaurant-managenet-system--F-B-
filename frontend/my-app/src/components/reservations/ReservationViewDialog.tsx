"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Reservation,
} from "@/types/reservation";

import ReservationStatusBadge from "./ReservationStatusBadge";

interface Props {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  reservation: Reservation | null;
}

function formatDate(value?: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export default function ReservationViewDialog({
  open,
  onOpenChange,
  reservation,
}: Props) {
  if (!reservation) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            Reservation Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">
              Customer
            </p>

            <p className="font-medium">
              {reservation.customer?.name}
            </p>

            <p className="text-sm text-slate-500">
              {reservation.customer?.phone}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Status
            </p>

            <ReservationStatusBadge
              status={reservation.status}
            />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Date
            </p>

            <p className="font-medium">
              {formatDate(
                reservation.reservationDate
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Start Time
            </p>

            <p className="font-medium">
              {formatDate(
                reservation.startTime
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Guests
            </p>

            <p className="font-medium">
              {reservation.guestCount}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Table
            </p>

            <p className="font-medium">
              {reservation.table
                ?.tableNumber || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Branch
            </p>

            <p className="font-medium">
              {reservation.branch?.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Special Request
            </p>

            <p className="font-medium">
              {reservation.specialRequest ||
                "None"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}