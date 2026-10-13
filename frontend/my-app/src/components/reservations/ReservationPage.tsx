"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/redux/store/store";

import {
  cancelReservation,
  checkReservationAvailability,
  confirmReservation,
  createReservation,
  fetchAdminReservations,
  fetchBranches,
  fetchReservationById,
  searchCustomers,
} from "@/redux/slice/reservationSlice";

import {
  Branch,
  Reservation,
  ReservationFormData,
} from "@/types/reservation";

import ReservationStats from "./ReservationStats";

import ReservationFilters from "./ReservationFilters";

import ReservationTable from "./ReservationTable";

import ReservationSkeleton from "./ReservationSkeleton";

import ReservationFormDialog from "./ReservationFormDialog";

import ReservationViewDialog from "./ReservationViewDialog";

import ConfirmationDialog from "./ConfirmationDialog";

interface Props {
  restaurants: { _id: string; name: string }[];
}

export default function ReservationPage({
  restaurants,
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    reservations,

    customers,

    availableTables,

    pagination,

    stats,

    loading,

    actionLoading,

    customerLoading,

    availabilityLoading,
  } = useSelector(
    (state: RootState) =>
      state.reservation
  );

  const [branchId, setBranchId] =
    useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const [status, setStatus] =
    useState("");

  const [date, setDate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [formOpen, setFormOpen] =
    useState(false);

  const [viewOpen, setViewOpen] =
    useState(false);

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(
      null
    );

  const [
    confirmationOpen,
    setConfirmationOpen,
  ] = useState(false);

  const [
    confirmationAction,
    setConfirmationAction,
  ] = useState<
    "confirm" | "cancel" | null
  >(null);

  // ============================================================
  // BRANCHES
  // ============================================================

  useEffect(() => {
    let isCurrent = true;

    const loadBranches = async () => {
      setBranchLoading(true);

      const branchGroups = await Promise.all(
        restaurants.map(({ _id: restaurantId }) =>
          dispatch(fetchBranches(restaurantId))
            .unwrap()
            .catch(() => [] as Branch[])
        )
      );

      if (isCurrent) {
        setBranches(
          branchGroups
            .flatMap((group, index) =>
              group.map((branch) => ({
                ...branch,
                restaurant:
                  branch.restaurant && typeof branch.restaurant === "object"
                    ? branch.restaurant
                    : restaurants[index] ?? branch.restaurant,
              }))
            )
            .filter((branch) => branch.isActive !== false)
        );
        setBranchLoading(false);
      }
    };

    void loadBranches();

    return () => {
      isCurrent = false;
    };
  }, [
    restaurants,
    dispatch,
  ]);

  // ============================================================
  // RESERVATIONS
  // ============================================================

  const loadReservations =
    useCallback(() => {
      dispatch(
        fetchAdminReservations({
          ...(branchId ? { branchId } : {}),
          page,
          limit: 10,
          ...(status ? { status } : {}),
          ...(date ? { date } : {}),
        })
      );
    }, [
      dispatch,
      branchId,
      page,
      status,
      date,
    ]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate =
    async (
      data: ReservationFormData
    ) => {
      const selectedBranchId = data.branchId || branchId;
      if (!selectedBranchId) return;

      const result = await dispatch(
        createReservation({
          branchId: selectedBranchId,
          data,
        })
      );

      if (
        createReservation.fulfilled.match(
          result
        )
      ) {
        setFormOpen(false);

        if (branchId !== selectedBranchId) {
          setBranchId(selectedBranchId);
          setPage(1);
        } else {
          loadReservations();
        }
      }
    };

  // ============================================================
  // CUSTOMER SEARCH
  // ============================================================

  const handleCustomerSearch =
    useCallback(
      (query: string) => {
        dispatch(
          searchCustomers(query)
        );
      },
      [dispatch]
    );

  // ============================================================
  // AVAILABILITY
  // ============================================================

  const handleAvailability =
    useCallback(
      (data: {
        branchId: string;

        reservationDate: string;

        startTime: string;

        endTime: string;

        guestCount: number;
      }) => {
        dispatch(
          checkReservationAvailability(
            data
          )
        );
      },
      [dispatch]
    );

  // ============================================================
  // VIEW
  // ============================================================

  const handleView = async (
    reservation: Reservation
  ) => {
    const result = await dispatch(
      fetchReservationById(
        reservation._id
      )
    );

    if (
      fetchReservationById.fulfilled.match(
        result
      )
    ) {
      setSelectedReservation(
        result.payload
      );

      setViewOpen(true);
    }
  };

  // ============================================================
  // CONFIRMATION
  // ============================================================

  const openConfirmation = (
    reservation: Reservation,
    action:
      | "confirm"
      | "cancel"
  ) => {
    setSelectedReservation(
      reservation
    );

    setConfirmationAction(action);

    setConfirmationOpen(true);
  };

  // ============================================================
  // CONFIRM ACTION
  // ============================================================

  const executeConfirmation =
    async () => {
      if (
        !selectedReservation ||
        !confirmationAction
      ) {
        return;
      }

      if (
        confirmationAction ===
        "confirm"
      ) {
        await dispatch(
          confirmReservation(
            selectedReservation._id
          )
        );
      }

      if (
        confirmationAction ===
        "cancel"
      ) {
        await dispatch(
          cancelReservation(
            selectedReservation._id
          )
        );
      }

      setConfirmationOpen(false);

      setSelectedReservation(null);

      setConfirmationAction(null);

      loadReservations();
    };

  // ============================================================
  // CLEAR FILTER
  // ============================================================

  const clearFilters = () => {
    setSearch("");

    setStatus("");

    setDate("");

    setPage(1);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const nextPage = () => {
    if (
      page < pagination.totalPages
    ) {
      setPage((current) =>
        current + 1
      );
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage((current) =>
        current - 1
      );
    }
  };

  return (
    <div className="min-h-full bg-[#f7f7f5] p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Reservations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} reservations
            found
          </p>
        </div>

        <Button
          onClick={() =>
            setFormOpen(true)
          }
          className="bg-[#91662f] hover:bg-[#7d5628]"
        >
          <Plus className="mr-2 h-4 w-4" />

          New Reservation
        </Button>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <ReservationStats
        stats={stats}
      />

      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
        <ReservationFilters
          search={search}
          status={status}
          branchId={branchId}
          date={date}
          branches={branches}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            setStatus(value);

            setPage(1);
          }}
          onBranchChange={(value) => {
            setBranchId(value);

            setPage(1);
          }}
          onDateChange={(value) => {
            setDate(value);

            setPage(1);
          }}
          onClear={clearFilters}
        />

        {loading ? (
          <ReservationSkeleton />
        ) : reservations.length ===
          0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center">
            <CalendarDays className="mb-3 h-10 w-10 text-slate-300" />

            <h3 className="font-medium text-slate-700">
              No reservations found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your filters
              or create a new reservation.
            </p>
          </div>
        ) : (
          <>
            <ReservationTable
              reservations={reservations}
              onView={handleView}
              onEdit={() => {
                // Edit dialog will use
                // the same reservation
                // form component.
              }}
              onConfirm={(reservation) =>
                openConfirmation(
                  reservation,
                  "confirm"
                )
              }
              onCancel={(reservation) =>
                openConfirmation(
                  reservation,
                  "cancel"
                )
              }
            />

            {/* ==================================================
                PAGINATION
            ================================================== */}

            <div className="flex items-center justify-between border-t px-5 py-4">
              <p className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-medium text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={
                    previousPage
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={nextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          CREATE
      ====================================================== */}

      <ReservationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        branches={branches}
        branchLoading={branchLoading}
        customers={customers}
        availableTables={
          availableTables
        }
        customerLoading={
          customerLoading
        }
        availabilityLoading={
          availabilityLoading
        }
        loading={actionLoading}
        onSearchCustomer={
          handleCustomerSearch
        }
        onCheckAvailability={
          handleAvailability
        }
        onSubmit={handleCreate}
      />

      {/* ======================================================
          VIEW
      ====================================================== */}

      <ReservationViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        reservation={
          selectedReservation
        }
      />

      {/* ======================================================
          CONFIRMATION
      ====================================================== */}

      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={
          setConfirmationOpen
        }
        loading={actionLoading}
        title={
          confirmationAction ===
          "confirm"
            ? "Accept Reservation?"
            : "Reject Reservation?"
        }
        description={
          confirmationAction ===
          "confirm"
            ? "Are you sure you want to accept this reservation?"
            : "Are you sure you want to reject this reservation?"
        }
        confirmText={
          confirmationAction ===
          "confirm"
            ? "Accept"
            : "Reject"
        }
        destructive={
          confirmationAction ===
          "cancel"
        }
        onConfirm={
          executeConfirmation
        }
      />
    </div>
  );
}