"use client";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import type {
  AppDispatch,
  RootState,
} from "@/redux/store/store";

import {
  getInventoryItems,
  getDeletedInventoryItems,
} from "@/redux/slice/inventorySlice";

import InventoryStats from "./InventoryStats";

import InventoryFilters from "./InventoryFilters";

import InventoryTable from "./InventoryTable";

import DeletedInventoryTable from "./DeletedInventoryTable";

import InventoryFormDialog from "./InventoryFormDialog";

import StockAdjustDialog from "./StockAdjustDialog";

import InventoryConfirmDialog from "./InventoryConfirmDialog";

import InventorySkeleton from "./InventorySkeleton";

import {
  Button,
} from "@/components/ui/button";

import {
  Plus,
  RotateCcw,
} from "lucide-react";

import type {
  InventoryItem,
  InventoryUnit,
} from "@/types/inventory";

interface InventoryBranchOption {
  _id: string;
  name: string;
  restaurantName: string;
}

export default function InventoryPage() {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    items,
    deletedItems,
    loading,
    deletedLoading,
    actionLoading,
    stats,
    total,
    page,
    totalPages,
    deletedTotal,
    deletedPage,
    deletedTotalPages,
  } = useSelector(
    (state: RootState) =>
      state.inventory
  );

  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [branchOptions, setBranchOptions] = useState<InventoryBranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDeletedPage, setCurrentDeletedPage] = useState(1);
  const selectedBranch = branchOptions.find(
    (branch) => branch._id === selectedBranchId
  );

  const [
    restoreMode,
    setRestoreMode,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    unit,
    setUnit,
  ] = useState("all");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingItem,
    setEditingItem,
  ] =
    useState<InventoryItem | null>(
      null
    );

  const [
    stockItem,
    setStockItem,
  ] =
    useState<InventoryItem | null>(
      null
    );

  const [
    deleteItem,
    setDeleteItem,
  ] =
    useState<InventoryItem | null>(
      null
    );

  const [
    restoreItem,
    setRestoreItem,
  ] =
    useState<InventoryItem | null>(
      null
    );

  const [
    hardDeleteItem,
    setHardDeleteItem,
  ] =
    useState<InventoryItem | null>(
      null
    );

  /* ==========================================================
     LOAD INVENTORY
  ========================================================== */

  useEffect(() => {
    let current = true;

    const loadBranches = async () => {
      try {
        const restaurantsResponse = await axiosInstance.get<{
          data?: { _id: string; name: string }[];
        }>(endpoints.restaurant.getAll);
        const restaurants = restaurantsResponse.data?.data || [];
        const branchResponses = await Promise.all(
          restaurants.map((restaurant) =>
            axiosInstance.get<{
              data?: { _id: string; name: string }[];
            }>(endpoints.branch.getByRestaurantId(restaurant._id))
          )
        );

        if (current) {
          setBranchOptions(
            branchResponses.flatMap((response, index) =>
              (response.data?.data || []).map((branch) => ({
                ...branch,
                restaurantName: restaurants[index].name,
              }))
            )
          );
        }
      } catch {
        if (current) setBranchOptions([]);
      } finally {
        if (current) setBranchesLoading(false);
      }
    };

    loadBranches();

    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (branchesLoading) return;

    if (restoreMode) {
      dispatch(
        getDeletedInventoryItems({
          branchId:
            selectedBranchId === "all"
              ? undefined
              : selectedBranchId,
          ...(selectedBranchId === "all"
            ? { branchIds: branchOptions.map((branch) => branch._id) }
            : {}),

          query: {
            page: currentDeletedPage,

            limit: 10,

            search:
              search || undefined,

            unit:
              unit !== "all"
                ? (unit as InventoryUnit)
                : undefined,
          },
        })
      );

      return;
    }

    dispatch(
      getInventoryItems({
        branchId:
          selectedBranchId === "all"
            ? undefined
            : selectedBranchId,
        ...(selectedBranchId === "all"
          ? { branchIds: branchOptions.map((branch) => branch._id) }
          : {}),

        query: {
          page: currentPage,

          limit: 10,

          search:
            search || undefined,

          isActive:
            status === "all"
              ? undefined
              : status === "active",

          unit:
            unit !== "all"
              ? (unit as InventoryUnit)
              : undefined,
        },
      })
    );
  }, [
    selectedBranchId,
    branchOptions,
    branchesLoading,
    restoreMode,
    currentPage,
    currentDeletedPage,
    refreshVersion,
    search,
    status,
    unit,
    dispatch,
  ]);

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Inventory</span>

            <span>/</span>

            <span className="font-medium text-foreground">
              {selectedBranch?.name || "All Branches"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Inventory
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage stock levels and
            ingredients
          </p>
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={() => {
              setRestoreMode(
                !restoreMode
              );
              setCurrentPage(1);
              setCurrentDeletedPage(1);

              setSearch("");

              setStatus("all");

              setUnit("all");
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />

            {restoreMode
              ? "Back to Inventory"
              : "Restore"}
          </Button>

          {!restoreMode && (
            <Button
              onClick={() => {
                setEditingItem(
                  null
                );

                setFormOpen(true);
              }}
              className="bg-[#9A6B2F] hover:bg-[#835A26]"
            >
              <Plus className="mr-2 h-4 w-4" />

              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* ACTIVE VIEW */}

      {!restoreMode && (
        <>
          <InventoryStats
            stats={stats}
          />

          <InventoryFilters
            branches={branchOptions}
            branchId={selectedBranchId}
            branchesLoading={branchesLoading}
            onBranchChange={(value) => {
              setSelectedBranchId(value);
              setCurrentPage(1);
              setCurrentDeletedPage(1);
            }}
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
              setCurrentDeletedPage(1);
            }}
            status={status}
            setStatus={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            unit={unit}
            setUnit={(value) => {
              setUnit(value);
              setCurrentPage(1);
              setCurrentDeletedPage(1);
            }}
            total={total}
          />

          {loading ? (
            <InventorySkeleton />
          ) : (
            <InventoryTable
              items={items}
              onAdjust={(item) =>
                setStockItem(item)
              }
              onEdit={(item) => {
                setEditingItem(
                  item
                );

                setFormOpen(true);
              }}
              onDelete={(item) =>
                setDeleteItem(item)
              }
            />
          )}

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Showing {items.length} of{" "}
              {total}
            </span>

            <span>
              Page {page} of{" "}
              {totalPages || 1}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* RESTORE VIEW */}

      {restoreMode && (
        <>
          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Deleted Inventory
              </h2>

              <p className="text-sm text-muted-foreground">
                Restore deleted items or
                permanently remove them.
              </p>
            </div>

            <label className="mb-5 block max-w-sm space-y-2 text-sm">
              <span className="font-medium">Branch</span>
              <select
                value={selectedBranchId}
                onChange={(event) => {
                  setSelectedBranchId(event.target.value);
                  setCurrentDeletedPage(1);
                }}
                disabled={branchesLoading}
                className="h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="all">All branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.restaurantName} · {branch.name}
                  </option>
                ))}
              </select>
            </label>

            {deletedLoading ? (
              <InventorySkeleton />
            ) : (
              <DeletedInventoryTable
                items={deletedItems}
                onRestore={(item) =>
                  setRestoreItem(item)
                }
                onHardDelete={(item) =>
                  setHardDeleteItem(
                    item
                  )
                }
              />
            )}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Showing{" "}
              {deletedItems.length}{" "}
              of {deletedTotal}
            </span>

            <span>
              Page {deletedPage} of{" "}
              {deletedTotalPages || 1}
            </span>
          </div>

          {deletedTotalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span>Page {deletedPage} of {deletedTotalPages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentDeletedPage <= 1 || deletedLoading}
                  onClick={() => setCurrentDeletedPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentDeletedPage >= deletedTotalPages || deletedLoading}
                  onClick={() => setCurrentDeletedPage((current) => Math.min(deletedTotalPages, current + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD / EDIT */}

      <InventoryFormDialog
        open={formOpen}
        onOpenChange={
          setFormOpen
        }
        branchId={
          selectedBranchId === "all" ? "" : selectedBranchId
        }
        branches={branchOptions}
        item={editingItem}
        loading={
          actionLoading
        }
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />

      {/* STOCK */}

      <StockAdjustDialog
        open={
          !!stockItem
        }
        onOpenChange={(open) => {
          if (!open) {
            setStockItem(null);
          }
        }}
        item={stockItem}
        loading={
          actionLoading
        }
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />

      {/* DELETE */}

      <InventoryConfirmDialog
        open={
          !!deleteItem
        }
        onOpenChange={(open) => {
          if (!open) {
            setDeleteItem(null);
          }
        }}
        type="delete"
        item={deleteItem}
        loading={
          actionLoading
        }
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />

      {/* RESTORE */}

      <InventoryConfirmDialog
        open={
          !!restoreItem
        }
        onOpenChange={(open) => {
          if (!open) {
            setRestoreItem(null);
          }
        }}
        type="restore"
        item={restoreItem}
        loading={
          actionLoading
        }
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />

      {/* HARD DELETE */}

      <InventoryConfirmDialog
        open={
          !!hardDeleteItem
        }
        onOpenChange={(open) => {
          if (!open) {
            setHardDeleteItem(
              null
            );
          }
        }}
        type="hardDelete"
        item={
          hardDeleteItem
        }
        loading={
          actionLoading
        }
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />
    </div>
  );
}