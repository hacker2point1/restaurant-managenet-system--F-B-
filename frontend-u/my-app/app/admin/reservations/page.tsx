"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, Check, Clock3, MapPin, Users, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store/store";

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no-show";

interface Reservation {
  _id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: ReservationStatus;
  specialRequest?: string;
  customer?: { name?: string; email?: string; phone?: string };
  branch?: { name?: string; branchCode?: string };
  table?: { tableNumber?: string; capacity?: number; location?: string };
}

interface ReservationListResponse {
  status: boolean;
  message: string;
  data: Reservation[];
  pagination: { total: number; page: number; totalPages: number };
}

const statusFilters = ["pending", "all", "confirmed", "rejected"] as const;
type StatusFilter = (typeof statusFilters)[number];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message;
  }

  return error instanceof Error ? error.message : "Request failed.";
}

export default function AdminReservationsPage() {
  const { user, isloggedIn, sessionChecked } = useSelector(
    (state: RootState) => state.auth
  );
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionChecked || !isloggedIn || !["admin", "manager"].includes(user?.role || "")) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadReservations() {
      setLoading(true);
      setError(null);

      try {
        const response = await AxiosInstance.get<ReservationListResponse>(
          endpoints.reservation.getAdminQueue,
          {
            params: { status: filter, page, limit: 20 },
            signal: controller.signal,
          }
        );

        if (!response.data.status) {
          throw new Error(response.data.message || "Unable to load reservations.");
        }

        setReservations(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.totalPages, 1));
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReservations();
    return () => controller.abort();
  }, [filter, page, sessionChecked, isloggedIn, user?.role]);

  async function decideReservation(reservationId: string, decision: "confirm" | "reject") {
    setActingOnId(reservationId);

    try {
      const response = await AxiosInstance.patch(
        decision === "confirm"
          ? endpoints.reservation.confirm(reservationId)
          : endpoints.reservation.reject(reservationId),
        {}
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Unable to update reservation.");
      }

      toast.success(
        decision === "confirm" ? "Reservation approved." : "Reservation rejected."
      );

      if (filter === "pending") {
        setReservations((current) => current.filter((item) => item._id !== reservationId));
        setTotal((current) => Math.max(current - 1, 0));
      } else {
        setReservations((current) =>
          current.map((item) =>
            item._id === reservationId
              ? { ...item, status: decision === "confirm" ? "confirmed" : "rejected" }
              : item
          )
        );
      }
    } catch (actionError: unknown) {
      toast.error(getErrorMessage(actionError));
    } finally {
      setActingOnId(null);
    }
  }

  if (!sessionChecked || loading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16 text-center text-slate-500">
        Loading reservations...
      </main>
    );
  }

  if (!isloggedIn || !["admin", "manager"].includes(user?.role || "")) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with an admin or manager account to review reservations.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Restaurant operations
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Reservation approvals
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review customer requests and approve or reject pending bookings.
              </p>
            </div>
            <p className="text-sm text-slate-500">{total} reservations</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2" aria-label="Reservation status filter">
            {statusFilters.map((status) => (
              <Button
                key={status}
                type="button"
                variant={filter === status ? "default" : "outline"}
                onClick={() => { setFilter(status); setPage(1); }}
                className={filter === status ? "bg-violet-600 text-white hover:bg-violet-700" : "capitalize"}
              >
                {status === "all" ? "All reservations" : status}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            No {filter === "all" ? "" : `${filter} `}reservations found.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {reservations.map((reservation) => (
              <article key={reservation._id} className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {reservation.customer?.name || "Customer"}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${reservation.status === "pending" ? "bg-amber-50 text-amber-800" : reservation.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {reservation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{reservation.customer?.email}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" />{reservation.branch?.name || "Branch"}</span>
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" />{formatDate(reservation.startTime)}</span>
                    <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-violet-600" />{reservation.guestCount} guests</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-violet-600" />Table {reservation.table?.tableNumber || "—"}</span>
                  </div>
                  {reservation.specialRequest && (
                    <p className="mt-3 text-sm text-slate-500">Request: {reservation.specialRequest}</p>
                  )}
                </div>

                {reservation.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      disabled={actingOnId !== null}
                      onClick={() => decideReservation(reservation._id, "reject")}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {actingOnId === reservation._id ? "Updating..." : "Reject"}
                    </Button>
                    <Button
                      type="button"
                      disabled={actingOnId !== null}
                      onClick={() => decideReservation(reservation._id, "confirm")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {actingOnId === reservation._id ? "Updating..." : "Approve"}
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-7 flex items-center justify-center gap-4">
            <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}