"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { CalendarDays, CircleUserRound, Pencil, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import { updateProfile } from "@/redux/slice/authSlice";
import type { AppDispatch, RootState } from "@/redux/store/store";
import LoginModal from "@/src/components/auth/LoginModal";

interface ReservationHistoryItem {
  _id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: string;
  specialRequest?: string;
  branch?: { name?: string; branchCode?: string };
  table?: { tableNumber?: string; location?: string };
}

interface ReservationHistoryResponse {
  status: boolean;
  message: string;
  data: ReservationHistoryItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isloggedIn, sessionChecked } = useSelector(
    (state: RootState) => state.auth
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState<ReservationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (!showReservations || !isloggedIn || user?.role !== "customer") return;

    const controller = new AbortController();

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await AxiosInstance.get<ReservationHistoryResponse>(
          endpoints.reservation.getMyHistory,
          { params: { page: 1, limit: 20 }, signal: controller.signal }
        );

        if (!response.data.status) {
          throw new Error(response.data.message || "Unable to load reservations.");
        }

        setReservations(response.data.data);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setHistoryError(
          axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || error.message
            : error instanceof Error
              ? error.message
              : "Unable to load reservations."
        );
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false);
      }
    }

    void loadHistory();
    return () => controller.abort();
  }, [showReservations, isloggedIn, user?.role]);

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("phone", phone.trim());
    setSaving(true);

    try {
      await dispatch(updateProfile(formData)).unwrap();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelReservation(reservationId: string) {
    setCancelingReservationId(reservationId);

    try {
      const response = await AxiosInstance.patch(
        endpoints.reservation.cancel(reservationId),
        {}
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Unable to cancel reservation.");
      }

      setReservations((current) =>
        current.map((reservation) =>
          reservation._id === reservationId
            ? { ...reservation, status: "cancelled" }
            : reservation
        )
      );
      toast.success(response.data.message || "Reservation cancelled.");
    } catch (error: unknown) {
      toast.error(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Unable to cancel reservation."
      );
    } finally {
      setCancelingReservationId(null);
    }
  }

  if (!sessionChecked) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-10 w-48" />
          </div>
        </section>
        <section className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-14">
          <aside className="space-y-6 border-b border-slate-200 pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </aside>
          <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </section>
      </main>
    );
  }

  if (!isloggedIn || !user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 text-center">
        <CircleUserRound className="h-12 w-12 text-violet-500" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-950">
          Sign in to view your profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your profile details and reservations are available after signing in.
        </p>
        <Button onClick={() => setLoginOpen(true)} className="mt-5 bg-violet-600 text-white hover:bg-violet-700">
          Sign in
        </Button>
        <LoginModal
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onCreateAccount={() => router.push("/register")}
        />
      </main>
    );
  }

  const imageUrl =
    typeof user?.profileImage === "string"
      ? user.profileImage
      : user?.profileImage?.url;

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            My profile
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-14">
        <aside className="border-b border-slate-200 pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">{user?.name}</p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowReservations(true)}
            className="mt-7 h-11 w-full justify-start rounded-xl bg-violet-600 px-3 font-semibold text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-500"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Reservations
          </Button>
        </aside>

        <div className="min-w-0 space-y-10">
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Personal details</h2>
                <p className="mt-1 text-sm text-slate-500">Update the details associated with your account.</p>
              </div>
              <Pencil className="h-5 w-5 text-slate-400" />
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  value={user?.email || ""}
                  readOnly
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl bg-violet-600 text-white hover:bg-violet-700">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </section>

        </div>
      </section>

      <Dialog open={showReservations} onOpenChange={setShowReservations}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:max-w-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Reservation history
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Review and manage your table reservations.
            </DialogDescription>
          </DialogHeader>

          {user?.role !== "customer" ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Reservation history is available for customer accounts.
            </p>
          ) : historyLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading reservations...</p>
          ) : historyError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{historyError}</p>
          ) : reservations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              You don&apos;t have any reservations yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {reservations.map((reservation) => {
                const canCancel = ["pending", "confirmed"].includes(reservation.status);

                return (
                  <article key={reservation._id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <div>
                      <h3 className="font-semibold text-slate-900">{reservation.branch?.name || "Restaurant branch"}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Table {reservation.table?.tableNumber || "—"} · {reservation.guestCount} {reservation.guestCount === 1 ? "guest" : "guests"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{formatDate(reservation.startTime)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${reservation.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : reservation.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                        {reservation.status}
                      </span>
                      {canCancel && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={cancelingReservationId !== null}
                          onClick={() => handleCancelReservation(reservation._id)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          {cancelingReservationId === reservation._id ? "Cancelling..." : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}