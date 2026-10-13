"use client";

import {
  useEffect,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CustomerSearch from "./CustomerSearch";

import AvailableTables from "./AvailableTables";

import {
  Branch,
  Customer,
  ReservationFormData,
} from "@/types/reservation";

interface Props {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  branches: Branch[];

  branchLoading: boolean;

  customers: Customer[];

  availableTables: any[];

  customerLoading: boolean;

  availabilityLoading: boolean;

  loading: boolean;

  onSearchCustomer: (
    query: string
  ) => void;

  onCheckAvailability: (
    data: {
      branchId: string;
      reservationDate: string;
      startTime: string;
      endTime: string;
      guestCount: number;
    }
  ) => void;

  onSubmit: (
    data: ReservationFormData
  ) => void;
}

function getBranchLabel(branch: Branch) {
  const restaurantName =
    typeof branch.restaurant === "object"
      ? branch.restaurant.name
      : undefined;

  return restaurantName
    ? `${branch.name} - ${restaurantName}`
    : branch.name;
}

export default function ReservationFormDialog({
  open,

  onOpenChange,

  branches,

  branchLoading,

  customers,

  availableTables,

  customerLoading,

  availabilityLoading,

  loading,

  onSearchCustomer,

  onCheckAvailability,

  onSubmit,
}: Props) {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [branchId, setBranchId] =
    useState("");

  const activeBranches = branches.filter(
    (branch) => branch.isActive !== false
  );
  const mainBranch = activeBranches.find((branch) =>
    /\bmain\b/i.test(`${branch.name} ${branch.branchCode ?? ""}`)
  );
  const effectiveBranchId =
    activeBranches.find((branch) => branch._id === branchId)?._id ||
    mainBranch?._id ||
    activeBranches[0]?._id ||
    "";
  const selectedBranch = activeBranches.find(
    (branch) => branch._id === effectiveBranchId
  );
  const selectedBranchLabel = selectedBranch
    ? getBranchLabel(selectedBranch)
    : undefined;

  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [guestCount, setGuestCount] =
    useState(2);

  const [table, setTable] =
    useState("");

  const [specialRequest, setSpecialRequest] =
    useState("");

  useEffect(() => {
    if (!open) {
      setCustomer(null);
      setBranchId("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setGuestCount(2);
      setTable("");
      setSpecialRequest("");
    }
  }, [open]);

  useEffect(() => {
    if (
      effectiveBranchId &&
      date &&
      startTime &&
      endTime &&
      guestCount > 0
    ) {
      const reservationDate =
        new Date(
          `${date}T00:00:00`
        ).toISOString();

      const start =
        new Date(
          `${date}T${startTime}:00`
        ).toISOString();

      const end =
        new Date(
          `${date}T${endTime}:00`
        ).toISOString();

      onCheckAvailability({
        branchId: effectiveBranchId,

        reservationDate,

        startTime: start,

        endTime: end,

        guestCount,
      });
    }
  }, [
    effectiveBranchId,
    date,
    startTime,
    endTime,
    guestCount,
    onCheckAvailability,
  ]);

  const handleSubmit = () => {
    if (
      !customer ||
      !effectiveBranchId ||
      !date ||
      !startTime ||
      !endTime ||
      !table
    ) {
      return;
    }

    const reservationDate =
      new Date(
        `${date}T00:00:00`
      ).toISOString();

    const start =
      new Date(
        `${date}T${startTime}:00`
      ).toISOString();

    const end =
      new Date(
        `${date}T${endTime}:00`
      ).toISOString();

    onSubmit({
      branchId: effectiveBranchId,
      customer: customer._id,

      reservationDate,

      startTime: start,

      endTime: end,

      guestCount,

      table,

      specialRequest,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            New Reservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <CustomerSearch
            value={customer}
            customers={customers}
            loading={customerLoading}
            onSearch={onSearchCustomer}
            onSelect={setCustomer}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Date{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Branch{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Select
                value={effectiveBranchId}
                onValueChange={(value) => {
                  setBranchId(value ?? "");
                  setTable("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch">
                    {selectedBranchLabel}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {activeBranches.length > 0 ? (
                    activeBranches.map((branch) => (
                      <SelectItem
                        key={branch._id}
                        value={branch._id}
                      >
                        {getBranchLabel(branch)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem
                      value={branchLoading ? "branches-loading" : "no-branches"}
                      disabled
                    >
                      {branchLoading ? "Loading branches..." : "No branches available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Time{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                End Time{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Guest Count{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) =>
                  setGuestCount(
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <AvailableTables
            tables={availableTables}
            selectedTable={table}
            loading={availabilityLoading}
            onSelect={setTable}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Notes
            </label>

            <Textarea
              value={specialRequest}
              onChange={(e) =>
                setSpecialRequest(
                  e.target.value
                )
              }
              placeholder="Special requests, occasion, preferences..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            disabled={
              loading ||
              !customer ||
              !branchId ||
              !date ||
              !startTime ||
              !endTime ||
              !table
            }
            onClick={handleSubmit}
            className="bg-[#91662f] hover:bg-[#7d5627]"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            Confirm Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}