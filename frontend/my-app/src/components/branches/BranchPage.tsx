"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hooks/hooks";

import { getRestaurants } from "@/redux/slice/restaurentSlice";

import {
  activateBranch,
  createBranch,
  deactivateBranch,
  fetchBranchById,
  fetchBranches,
  softDeleteBranch,
  updateBranch,
} from "@/redux/slice/branchSlice";

import type { Branch } from "@/types/branch";

import { BranchStats } from "./BranchStats";
import { BranchFilters } from "./BranchFilters";
import { BranchTable } from "./BranchTable";
import { BranchViewDialog } from "./BranchViewDialog";
import { BranchFormDialog } from "./BranchFormDialog";
import { BranchConfirmationDialog } from "./BranchConfirmationDialog";
import { BranchSkeleton } from "./BranchSkeleton";

type ConfirmationAction =
  | "activate"
  | "deactivate"
  | "delete"
  | null;

export function BranchPage() {
  const dispatch = useAppDispatch();
  const restaurants = useAppSelector(
    (state) => state.restaurant.restaurants
  );
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState("");
  const restaurantId =
    selectedRestaurantId || restaurants[0]?._id || "";

  const {
    branches,
    loading,
    detailsLoading,
    actionLoading,
    stats,
    selectedBranch,
  } = useAppSelector(
    (state) => state.branch
  );

  const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [status, setStatus] =
    useState("all");

  const [city, setCity] =
    useState("all");

  const [viewOpen, setViewOpen] =
    useState(false);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingBranch, setEditingBranch] =
    useState<Branch | null>(null);

  const [
    confirmationAction,
    setConfirmationAction,
  ] =
    useState<ConfirmationAction>(null);

  const [
    confirmationBranch,
    setConfirmationBranch,
  ] =
    useState<Branch | null>(null);

  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (!restaurantId) return;

    dispatch(
      fetchBranches(restaurantId)
    );
  }, [dispatch, restaurantId]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        branches
          .map(
            (branch) =>
              branch.address?.city
          )
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        !normalizedSearch ||
        branch.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        branch.branchCode
          .toLowerCase()
          .includes(normalizedSearch) ||
        branch.address?.city
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        branch.contact?.phone
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        status === "all" ||
        (status === "active" &&
          branch.isActive) ||
        (status === "inactive" &&
          !branch.isActive);

      const matchesCity =
        city === "all" ||
        branch.address?.city === city;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCity
      );
    });
  }, [
    branches,
    search,
    status,
    city,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedBranches = filteredBranches.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize
  );

  const handleView = async (
    branch: Branch
  ) => {
    setViewOpen(true);

    await dispatch(
      fetchBranchById(branch._id)
    );
  };

  const handleEdit = async (
    branch: Branch
  ) => {
    setEditingBranch(branch);

    setFormOpen(true);

    await dispatch(
      fetchBranchById(branch._id)
    );
  };

  const handleCreate = async (
    data: FormData
  ) => {
    const result = await dispatch(
      createBranch({
        restaurantId,
        data,
      })
    );

    if (
      createBranch.fulfilled.match(result)
    ) {
      setFormOpen(false);
    }
  };

  const handleUpdate = async (
    data: FormData
  ) => {
    if (!editingBranch) return;

    const result = await dispatch(
      updateBranch({
        id: editingBranch._id,
        data,
      })
    );

    if (
      updateBranch.fulfilled.match(result)
    ) {
      setFormOpen(false);
      setEditingBranch(null);
    }
  };

  const openConfirmation = (
    branch: Branch,
    action: ConfirmationAction
  ) => {
    setConfirmationBranch(branch);
    setConfirmationAction(action);
  };

  const closeConfirmation = () => {
    if (actionLoading) return;

    setConfirmationBranch(null);
    setConfirmationAction(null);
  };

  const executeConfirmation = async () => {
    if (
      !confirmationBranch ||
      !confirmationAction
    ) {
      return;
    }

    let result;

    switch (confirmationAction) {
      case "activate":
        result = await dispatch(
          activateBranch(
            confirmationBranch._id
          )
        );
        break;

      case "deactivate":
        result = await dispatch(
          deactivateBranch(
            confirmationBranch._id
          )
        );
        break;

      case "delete":
        result = await dispatch(
          softDeleteBranch(
            confirmationBranch._id
          )
        );
        break;
    }

    if (
      result &&
      !result.type.endsWith("/rejected")
    ) {
      closeConfirmation();
    }
  };

  const confirmationConfig = useMemo(() => {
    if (!confirmationAction) {
      return {
        title: "",
        description: "",
        confirmText: "Confirm",
        destructive: false,
      };
    }

    if (confirmationAction === "activate") {
      return {
        title: "Activate branch?",
        description: `Are you sure you want to activate ${confirmationBranch?.name}?`,
        confirmText: "Activate",
        destructive: false,
      };
    }

    if (
      confirmationAction === "deactivate"
    ) {
      return {
        title: "Deactivate branch?",
        description: `Are you sure you want to deactivate ${confirmationBranch?.name}?`,
        confirmText: "Deactivate",
        destructive: true,
      };
    }

    return {
      title: "Delete branch?",
      description: `Are you sure you want to delete ${confirmationBranch?.name}? This will soft delete the branch.`,
      confirmText: "Delete",
      destructive: true,
    };
  }, [
    confirmationAction,
    confirmationBranch,
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Branches
          </h1>

          <p className="mt-1 text-muted-foreground">
            Monitor locations, staffing, and daily operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={restaurantId || "no-restaurants"}
            onValueChange={(value) => {
              setSelectedRestaurantId(value ?? "");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-[220px]">
              <SelectValue placeholder="Select restaurant">
                {(value) =>
                  value === "no-restaurants"
                    ? "No restaurants available"
                    : restaurants.find(
                        (restaurant) => restaurant._id === value
                      )?.name ?? "Select restaurant"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <SelectItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-restaurants" disabled>
                  No restaurants available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-11"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            className="h-11 bg-[#95692f] hover:bg-[#805a29]"
            disabled={!restaurantId}
            onClick={() => {
              setEditingBranch(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add branch
          </Button>
        </div>
      </div>

      {/* STATS */}

      <BranchStats
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
      />

      {loading ? (
        <BranchSkeleton />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* FILTERS */}

          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-4">
              <BranchFilters
                search={search}
                status={status}
                city={city}
                cities={cities}
                onSearchChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                onStatusChange={(value) => {
                  setStatus(value);
                  setCurrentPage(1);
                }}
                onCityChange={(value) => {
                  setCity(value);
                  setCurrentPage(1);
                }}
                onClear={() => {
                  setSearch("");
                  setStatus("all");
                  setCity("all");
                  setCurrentPage(1);
                }}
              />

              <p className="hidden shrink-0 text-sm font-medium text-muted-foreground lg:block">
                {filteredBranches.length} locations
              </p>
            </div>
          </div>

          {/* TABLE */}

          <BranchTable
            branches={paginatedBranches}
            onView={handleView}
            onEdit={handleEdit}
            onActivate={(branch) =>
              openConfirmation(
                branch,
                "activate"
              )
            }
            onDeactivate={(branch) =>
              openConfirmation(
                branch,
                "deactivate"
              )
            }
            onDelete={(branch) =>
              openConfirmation(
                branch,
                "delete"
              )
            }
          />

          {filteredBranches.length > pageSize && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                Showing {(visiblePage - 1) * pageSize + 1}–{Math.min(visiblePage * pageSize, filteredBranches.length)} of {filteredBranches.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={visiblePage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2">Page {visiblePage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={visiblePage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW */}

      <BranchViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        branch={selectedBranch}
        loading={detailsLoading}
      />

      {/* CREATE / EDIT */}

      <BranchFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBranch(null);
          }

          setFormOpen(open);
        }}
        branch={
          editingBranch
            ? selectedBranch ||
              editingBranch
            : null
        }
        loading={actionLoading}
        onSubmit={
          editingBranch
            ? handleUpdate
            : handleCreate
        }
      />

      {/* CONFIRMATION */}

      <BranchConfirmationDialog
        open={
          Boolean(confirmationAction)
        }
        onOpenChange={(open) => {
          if (!open) {
            closeConfirmation();
          }
        }}
        title={
          confirmationConfig.title
        }
        description={
          confirmationConfig.description
        }
        confirmText={
          confirmationConfig.confirmText
        }
        destructive={
          confirmationConfig.destructive
        }
        loading={actionLoading}
        onConfirm={
          executeConfirmation
        }
      />
    </div>
  );
}