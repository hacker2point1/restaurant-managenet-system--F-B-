"use client";

import {
  MoreHorizontal,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Reservation,
} from "@/types/reservation";

import ReservationStatusBadge from "./ReservationStatusBadge";

interface Props {
  reservations: Reservation[];

  onView: (
    reservation: Reservation
  ) => void;

  onEdit: (
    reservation: Reservation
  ) => void;

  onConfirm: (
    reservation: Reservation
  ) => void;

  onCancel: (
    reservation: Reservation
  ) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(date));
}

export default function ReservationTable({
  reservations,
  onView,
  onEdit,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />

            <TableHead>ID</TableHead>

            <TableHead>Customer</TableHead>

            <TableHead>Date & Time</TableHead>

            <TableHead>Guests</TableHead>

            <TableHead>Table</TableHead>

            <TableHead>Branch</TableHead>

            <TableHead>Source</TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reservations.map(
            (reservation) => (
              <TableRow
                key={reservation._id}
                className="hover:bg-slate-50"
              >
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs text-slate-500">
                    {reservation._id.slice(
                      -8
                    )}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e7d7] text-sm font-semibold text-[#8b622d]">
                      {reservation.customer?.name
                        ?.charAt(0)
                        ?.toUpperCase() || (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-slate-800">
                        {
                          reservation
                            .customer?.name
                        }
                      </p>

                      <p className="text-xs text-slate-400">
                        {
                          reservation
                            .customer?.phone
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-medium text-slate-700">
                      {formatDate(
                        reservation.reservationDate
                      )}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatTime(
                        reservation.startTime
                      )}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  {reservation.guestCount}
                </TableCell>

                <TableCell className="font-medium">
                  {reservation.table
                    ?.tableNumber || "—"}
                </TableCell>

                <TableCell className="text-slate-500">
                  {
                    reservation.branch
                      ?.name
                  }
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      reservation.bookingSource === "online"
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {reservation.bookingSource === "online"
                      ? "Online"
                      : "On the spot"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <ReservationStatusBadge
                    status={
                      reservation.status
                    }
                  />
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />

                    <DropdownMenuContent
                      align="end"
                      className="w-44"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          onView(
                            reservation
                          )
                        }
                      >
                        View
                      </DropdownMenuItem>

                      {[
                        "pending",
                        "confirmed",
                      ].includes(
                        reservation.status
                      ) && (
                        <DropdownMenuItem
                          onClick={() =>
                            onEdit(
                              reservation
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                      )}

                      {reservation.status ===
                        "pending" && (
                        <>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              onConfirm(
                                reservation
                              )
                            }
                          >
                            Accept
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() =>
                              onCancel(
                                reservation
                              )
                            }
                          >
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}