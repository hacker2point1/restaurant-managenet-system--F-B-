"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Grid2X2,
  List,
  Plus,
  Settings2,
} from "lucide-react";

import { toast } from "sonner";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hooks/hooks";

import {
  createTable,
  fetchTables,
  releaseTable,
  softDeleteTable,
  updateTable,
  updateTableStatus,
  allocateTable,
} from "@/redux/slice/tableSlice";
import { getRestaurants } from "@/redux/slice/restaurentSlice";

import {
  Table,
  TableStatus,
} from "@/types/table";
import type { Restaurant } from "@/types/restaurent";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
} from "@/components/ui/card";

import TableFloorView from "./table-floor-view";
import TableListView from "./table-list-view";
import TableFormDialog from "./table-form-dialog";
import TableSkeleton from "./table-skeleton";
import TableLayoutDialog from "./table-layout-dialog";

import ConfirmationDialog from "@/components/common/confirmation-dialog";

interface BranchOption {
  _id: string;
  name: string;
  branchCode?: string;
}

type ActionType =
  | "delete"
  | "allocate"
  | "release"
  | "status"
  | null;

export default function TablePage() {
  const dispatch = useAppDispatch();

  const {
    tables,
    loading,
    actionLoading,
    error,
  } = useAppSelector(
    (state) => state.table
  );
  const restaurants = useAppSelector(
    (state) => state.restaurant.restaurants
  );

  const [selectedRestaurantId, setSelectedRestaurantId] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [availableBranches, setAvailableBranches] = useState<BranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const branchRequestId = useRef(0);

  const tableFilters = useMemo(
    () => ({
      restaurantId:
        selectedRestaurantId === "all"
          ? undefined
          : selectedRestaurantId,
      branchId:
        selectedBranchId === "all"
          ? undefined
          : selectedBranchId,
    }),
    [selectedRestaurantId, selectedBranchId]
  );
  const selectedRestaurant = restaurants.find(
    (restaurant: Restaurant) => restaurant._id === selectedRestaurantId
  );
  const selectedBranch = availableBranches.find(
    (branch) => branch._id === selectedBranchId
  );
  const selectedRestaurantLabel =
    selectedRestaurant?.name ??
    (selectedRestaurantId === "all" ? "All restaurants" : undefined);
  const selectedBranchLabel = selectedBranch
    ? `${selectedBranch.name}${selectedBranch.branchCode ? ` (${selectedBranch.branchCode})` : ""}`
    : selectedBranchId === "all"
      ? "All branches"
      : undefined;

  const [view, setView] = useState<
    "floor" | "list"
  >("floor");

  const [locationFilter, setLocationFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [columns, setColumns] = useState(4);

  const [layoutOpen, setLayoutOpen] =
    useState(false);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingTable, setEditingTable] =
    useState<Table | null>(null);

  const [confirmationOpen, setConfirmationOpen] =
    useState(false);

  const [actionType, setActionType] =
    useState<ActionType>(null);

  const [selectedTable, setSelectedTable] =
    useState<Table | null>(null);

  // ==========================================================
  // FETCH
  // ==========================================================

  const loadTables = () => dispatch(fetchTables(tableFilters));

  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTables(tableFilters));
  }, [dispatch, tableFilters]);

  const handleRestaurantChange = async (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedBranchId("all");
    setAvailableBranches([]);
    setCurrentPage(1);

    const requestId = ++branchRequestId.current;
    if (restaurantId === "all") {
      setBranchesLoading(false);
      return;
    }

    setBranchesLoading(true);
    try {
      const response = await AxiosInstance.get<{
        data?: BranchOption[];
      }>(endpoints.branch.getByRestaurantId(restaurantId));

      if (requestId === branchRequestId.current) {
        setAvailableBranches(response.data.data ?? []);
      }
    } catch {
      if (requestId === branchRequestId.current) {
        toast.error("Could not load branches for this restaurant.");
      }
    } finally {
      if (requestId === branchRequestId.current) {
        setBranchesLoading(false);
      }
    }
  };

  // ==========================================================
  // ERROR
  // ==========================================================

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const locationMatch =
        locationFilter === "all" ||
        table.location === locationFilter;

      const statusMatch =
        statusFilter === "all" ||
        table.status === statusFilter;

      return locationMatch && statusMatch;
    });
  }, [
    tables,
    locationFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTables.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedTables = filteredTables.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize
  );

  const tableSummary = useMemo(() => ({
    totalTables: tables.length,
    availableTables: tables.filter((table) => table.status === "available").length,
    reservedTables: tables.filter((table) => table.status === "reserved").length,
    occupiedTables: tables.filter((table) => table.status === "occupied").length,
    maintenanceTables: tables.filter((table) => table.status === "maintenance").length,
  }), [tables]);

  // ==========================================================
  // ADD
  // ==========================================================

  const handleAdd = () => {
    setEditingTable(null);
    setFormOpen(true);
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormOpen(true);
  };

  // ==========================================================
  // FORM SUBMIT
  // ==========================================================

  const handleFormSubmit = async (
    data: {
      branchId: string;
      tableNumber: string;
      capacity: number;
      location:
        | "indoor"
        | "outdoor"
        | "rooftop"
        | "private"
        | "bar";
      isActive: boolean;
    }
  ) => {
    const { branchId, ...tableData } = data;

    try {
      if (editingTable) {
        await dispatch(
          updateTable({
            id: editingTable._id,
            payload: tableData,
          })
        ).unwrap();

        toast.success(
          "Table updated successfully"
        );
      } else {
        await dispatch(
          createTable({
            branchId,
            payload: {
              ...tableData,
              status: "available",
            },
          })
        ).unwrap();

        toast.success(
          "Table created successfully"
        );
      }

      setFormOpen(false);
      setEditingTable(null);

      if (!editingTable && branchId !== selectedBranchId) {
        setSelectedBranchId(branchId);
      } else {
        loadTables();
      }
    } catch {
      // Redux already contains the error.
    }
  };

  // ==========================================================
  // CONFIRMATION
  // ==========================================================

  const openConfirmation = (
    table: Table,
    action: ActionType
  ) => {
    setSelectedTable(table);
    setActionType(action);
    setConfirmationOpen(true);
  };

  // ==========================================================
  // CONFIRM ACTION
  // ==========================================================

  const handleConfirmAction = async () => {
    if (!selectedTable || !actionType) {
      return;
    }

    try {
      if (actionType === "delete") {
        await dispatch(
          softDeleteTable(
            selectedTable._id
          )
        ).unwrap();

        toast.success(
          "Table deleted successfully"
        );
      }

      if (actionType === "allocate") {
        await dispatch(
          allocateTable(
            selectedTable._id
          )
        ).unwrap();

        toast.success(
          "Table allocated successfully"
        );
      }

      if (actionType === "release") {
        await dispatch(
          releaseTable(
            selectedTable._id
          )
        ).unwrap();

        toast.success(
          "Table released successfully"
        );
      }

      setConfirmationOpen(false);

      setSelectedTable(null);

      setActionType(null);

      loadTables();
    } catch {
      // Error handled by Redux.
    }
  };

  // ==========================================================
  // STATUS CHANGE
  // ==========================================================

  const handleStatusChange = async (
    table: Table
  ) => {
    const nextStatus: TableStatus =
      table.status === "available"
        ? "maintenance"
        : "available";

    try {
      await dispatch(
        updateTableStatus({
          id: table._id,
          status: nextStatus,
        })
      ).unwrap();

      toast.success(
        `Table marked as ${nextStatus}`
      );

      loadTables();
    } catch {
      // Redux handles error.
    }
  };

  // ==========================================================
  // CONFIRMATION TEXT
  // ==========================================================

  const confirmationConfig = {
    delete: {
      title: "Delete table?",
      description: `Are you sure you want to delete ${selectedTable?.tableNumber}? This will soft delete the table.`,
      confirmText: "Delete table",
      destructive: true,
    },

    allocate: {
      title: "Allocate table?",
      description: `Are you sure you want to allocate ${selectedTable?.tableNumber}?`,
      confirmText: "Allocate",
      destructive: false,
    },

    release: {
      title: "Release table?",
      description: `Are you sure you want to release ${selectedTable?.tableNumber}?`,
      confirmText: "Release",
      destructive: false,
    },

    status: {
      title: "Change table status?",
      description: `Are you sure you want to change the status of ${selectedTable?.tableNumber}?`,
      confirmText: "Change status",
      destructive: false,
    },
  };

  const currentConfirmation =
    actionType
      ? confirmationConfig[actionType]
      : null;

  return (
    <div className="min-h-full bg-[#f7f8f8] p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tables
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {tableSummary.totalTables}{" "}
            tables
            {selectedBranch
              ? ` at ${selectedBranch.name}`
              : selectedRestaurant
                ? ` at ${selectedRestaurant.name} · all branches`
                : " across all restaurants"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setLayoutOpen(true)
            }
            className="bg-white"
          >
            <Settings2 className="mr-2 h-4 w-4" />

            Configure Layout
          </Button>

          <Button
            onClick={handleAdd}
            className="bg-[#95682f] hover:bg-[#825a28]"
          >
            <Plus className="mr-2 h-4 w-4" />

            Add Table
          </Button>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Available"
          value={
            tableSummary.availableTables
          }
          dot="bg-emerald-500"
        />

        <SummaryCard
          label="Reserved"
          value={
            tableSummary.reservedTables
          }
          dot="bg-[#a97a38]"
        />

        <SummaryCard
          label="Occupied"
          value={
            tableSummary.occupiedTables
          }
          dot="bg-blue-500"
        />

        <SummaryCard
          label="Maintenance"
          value={
            tableSummary.maintenanceTables
          }
          dot="bg-red-500"
        />
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select
            value={selectedRestaurantId}
            onValueChange={(value) => handleRestaurantChange(value ?? "all")}
          >
            <SelectTrigger className="w-[190px] bg-white">
              <SelectValue placeholder="All restaurants">
                {selectedRestaurantLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All restaurants</SelectItem>
              {restaurants.map((restaurant: Restaurant) => (
                <SelectItem key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedBranchId}
            onValueChange={(value) => {
              setSelectedBranchId(value ?? "all");
              setCurrentPage(1);
            }}
            disabled={selectedRestaurantId === "all" || branchesLoading}
          >
            <SelectTrigger className="w-[190px] bg-white">
              <SelectValue placeholder="All branches">
                {selectedBranchLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {availableBranches.length > 0 ? (
                availableBranches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}{branch.branchCode ? ` (${branch.branchCode})` : ""}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {branchesLoading ? "Loading branches..." : "No branches available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Status
              </SelectItem>

              <SelectItem value="available">
                Available
              </SelectItem>

              <SelectItem value="reserved">
                Reserved
              </SelectItem>

              <SelectItem value="occupied">
                Occupied
              </SelectItem>

              <SelectItem value="maintenance">
                Maintenance
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={locationFilter}
            onValueChange={(value) => {
              setLocationFilter(value ?? "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Locations
              </SelectItem>

              <SelectItem value="indoor">
                Indoor
              </SelectItem>

              <SelectItem value="outdoor">
                Outdoor
              </SelectItem>

              <SelectItem value="rooftop">
                Rooftop
              </SelectItem>

              <SelectItem value="private">
                Private
              </SelectItem>

              <SelectItem value="bar">
                Bar
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={view}
          onValueChange={(value) =>
            setView(
              value as "floor" | "list"
            )
          }
        >
          <TabsList className="bg-white">
            <TabsTrigger value="floor">
              <Grid2X2 className="mr-2 h-4 w-4" />
              Floor View
            </TabsTrigger>

            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ======================================================
          TABLE CONTENT
      ====================================================== */}

      <Card className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        {loading ? (
          <TableSkeleton count={8} />
        ) : filteredTables.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Grid2X2 className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="font-semibold">
              No tables found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your filters or add a
              new table.
            </p>

            <Button
              onClick={handleAdd}
              className="mt-4 bg-[#95682f] hover:bg-[#825a28]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </div>
        ) : view === "floor" ? (
          <TableFloorView
            tables={paginatedTables}
            columns={columns}
            onEdit={handleEdit}
            onDelete={(table) =>
              openConfirmation(
                table,
                "delete"
              )
            }
            onAllocate={(table) =>
              openConfirmation(
                table,
                "allocate"
              )
            }
            onRelease={(table) =>
              openConfirmation(
                table,
                "release"
              )
            }
            onStatusChange={
              handleStatusChange
            }
          />
        ) : (
          <TableListView
            tables={paginatedTables}
            onEdit={handleEdit}
            onDelete={(table) =>
              openConfirmation(
                table,
                "delete"
              )
            }
          />
        )}

        {!loading && filteredTables.length > pageSize && (
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">
              Showing {(visiblePage - 1) * pageSize + 1}–{Math.min(visiblePage * pageSize, filteredTables.length)} of {filteredTables.length}
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
      </Card>

      {/* ======================================================
          FORM DIALOG
      ====================================================== */}

      <TableFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        table={editingTable}
        restaurants={restaurants}
        selectedRestaurantId={selectedRestaurantId}
        onRestaurantChange={handleRestaurantChange}
        branches={availableBranches}
        branchesLoading={branchesLoading}
        selectedBranchId={selectedBranchId}
        loading={actionLoading}
        onSubmit={handleFormSubmit}
      />

      {/* ======================================================
          LAYOUT DIALOG
      ====================================================== */}

      <TableLayoutDialog
        open={layoutOpen}
        onOpenChange={setLayoutOpen}
        columns={columns}
        onColumnsChange={setColumns}
      />

      {/* ======================================================
          CONFIRMATION
      ====================================================== */}

      {currentConfirmation && (
        <ConfirmationDialog
          open={confirmationOpen}
          onOpenChange={
            setConfirmationOpen
          }
          title={
            currentConfirmation.title
          }
          description={
            currentConfirmation.description
          }
          confirmText={
            currentConfirmation.confirmText
          }
          destructive={
            currentConfirmation.destructive
          }
          loading={actionLoading}
          onConfirm={
            handleConfirmAction
          }
        />
      )}
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: string;
}) {
  return (
    <Card className="rounded-xl border bg-white px-4 py-3 shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={`h-2.5 w-2.5 rounded-full ${dot}`}
          />

          {label}
        </div>

        <span className="text-lg font-bold">
          {value}
        </span>
      </div>
    </Card>
  );
}