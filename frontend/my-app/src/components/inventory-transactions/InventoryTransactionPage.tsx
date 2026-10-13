"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Download,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";

import {
  adjustStock,
  getInventoryTransactionById,
  getInventoryTransactionReport,
  getInventoryTransactions,
  purchaseStock,
  recordReturn,
  recordWastage,
  stockIn,
  stockOut,
} from "@/redux/slice/inventoryTransactionSlice";

import InventoryTransactionStats from "./InventoryTransactionStats";

import InventoryTransactionFilters from "./InventoryTransactionFilters";

import InventoryTransactionTable from "./InventoryTransactionTable";

import TransactionFormDialog from "./TransactionFormDialog";

import TransactionConfirmDialog from "./TransactionConfirmDialog";

import TransactionDetailsDialog from "./TransactionDetailsDialog";

import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "@/types/inventoryTransaction";

import type { RootState } from "@/redux/store/store";

interface Branch {
  _id: string;
  name: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  sku?: string;
  unit: string;
  currentQuantity?: number;
  branchName?: string;
}

interface Props {
  branches: Branch[];

  inventoryItems: InventoryItem[];

  inventoryLoading: boolean;
}

interface PendingTransaction {
  type: InventoryTransactionType;
  inventoryItem: string;
  quantity?: number;
  unitCost?: number;
  newQuantity?: number;
  reason?: string;
  referenceId?: string;
}

const getMonthRange = () => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  );

  return {
    startDate: start
      .toISOString()
      .split("T")[0],

    endDate: end
      .toISOString()
      .split("T")[0],
  };
};

export default function InventoryTransactionPage({
  branches,
  inventoryItems,
  inventoryLoading,
}: Props) {
  const dispatch = useAppDispatch();

  const {
    transactions,
    pagination,
    report,
    loading,
    reportLoading,
    detailsLoading,
    actionLoading,
    selectedTransaction,
  } = useAppSelector(
    (state: RootState) =>
      state.inventoryTransaction
  );

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("all");

  const [branch, setBranch] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    pendingTransaction,
    setPendingTransaction,
  ] =
    useState<PendingTransaction | null>(
      null
    );

  const limit = 10;

  // ==========================================================
  // FETCH TRANSACTIONS
  // ==========================================================

  const fetchTransactions =
    useCallback(() => {
      dispatch(
        getInventoryTransactions({
          page,
          limit,

          ...(search.trim()
            ? {
                search: search.trim(),
              }
            : {}),

          ...(type !== "all"
            ? {
                type: type as InventoryTransactionType,
              }
            : {}),

          ...(branch !== "all"
            ? {
                branch,
              }
            : {}),
        })
      );
    }, [
      dispatch,
      page,
      limit,
      search,
      type,
      branch,
    ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ==========================================================
  // FETCH MONTHLY REPORT
  // ==========================================================

  useEffect(() => {
    const {
      startDate,
      endDate,
    } = getMonthRange();

    dispatch(
      getInventoryTransactionReport({
        ...(branch !== "all"
          ? {
              branch,
            }
          : {}),
        startDate,
        endDate,
      })
    );
  }, [dispatch, branch]);

  // ==========================================================
  // FORM SUBMIT
  // ==========================================================

  const handleFormSubmit = (
    data: PendingTransaction
  ) => {
    setPendingTransaction(data);

    setFormOpen(false);

    setConfirmOpen(true);
  };

  // ==========================================================
  // CONFIRM ACTION
  // ==========================================================

  const handleConfirm = async () => {
    if (!pendingTransaction) return;

    try {
      const data =
        pendingTransaction;

      switch (data.type) {
        case "stock-in":
          await dispatch(
            stockIn({
              inventoryItem:
                data.inventoryItem,

              quantity:
                data.quantity || 0,

              unitCost:
                data.unitCost,

              reason: data.reason,

              referenceType:
                "manual",

              referenceId:
                data.referenceId,
            })
          ).unwrap();

          break;

        case "stock-out":
          await dispatch(
            stockOut({
              inventoryItem:
                data.inventoryItem,

              quantity:
                data.quantity || 0,

              reason: data.reason,

              referenceType:
                "manual",

              referenceId:
                data.referenceId,
            })
          ).unwrap();

          break;

        case "purchase":
          await dispatch(
            purchaseStock({
              inventoryItem:
                data.inventoryItem,

              quantity:
                data.quantity || 0,

              unitCost:
                data.unitCost || 0,

              referenceId:
                data.referenceId,

              reason: data.reason,
            })
          ).unwrap();

          break;

        case "wastage":
          await dispatch(
            recordWastage({
              inventoryItem:
                data.inventoryItem,

              quantity:
                data.quantity || 0,

              reason:
                data.reason || "",
            })
          ).unwrap();

          break;

        case "return":
          await dispatch(
            recordReturn({
              inventoryItem:
                data.inventoryItem,

              quantity:
                data.quantity || 0,

              referenceId:
                data.referenceId,

              reason: data.reason,
            })
          ).unwrap();

          break;

        case "adjustment":
          await dispatch(
            adjustStock({
              inventoryItem:
                data.inventoryItem,

              newQuantity:
                data.newQuantity || 0,

              reason:
                data.reason || "",
            })
          ).unwrap();

          break;
      }

      toast.success(
        "Transaction recorded successfully"
      );

      setConfirmOpen(false);

      setPendingTransaction(null);

      await Promise.all([
        dispatch(
          getInventoryTransactions({
            page,
            limit,
            ...(search.trim()
              ? {
                  search: search.trim(),
                }
              : {}),
            ...(type !== "all"
              ? {
                  type: type as InventoryTransactionType,
                }
              : {}),
            ...(branch !== "all"
              ? {
                  branch,
                }
              : {}),
          })
        ).unwrap(),
        dispatch(
          getInventoryTransactionReport({
            ...(branch !== "all"
              ? {
                  branch,
                }
              : {}),
            ...getMonthRange(),
          })
        ).unwrap(),
      ]);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Transaction failed"
      );
    }
  };

  // ==========================================================
  // VIEW DETAILS
  // ==========================================================

  const handleView = (
    transaction: InventoryTransaction
  ) => {
    setDetailsOpen(true);

    dispatch(
      getInventoryTransactionById(
        transaction._id
      )
    );
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    setSearch("");
    setType("all");
    setBranch("");
    setPage(1);
  };

  // ==========================================================
  // EXPORT CURRENT PAGE
  // ==========================================================

  const handleExport = () => {
    if (!transactions.length) {
      toast.info(
        "There are no transactions to export."
      );

      return;
    }

    const headers = [
      "Transaction ID",
      "Item",
      "SKU",
      "Type",
      "Quantity",
      "Unit",
      "Branch",
      "Recorded By",
      "Date",
      "Reference",
    ];

    const rows = transactions.map(
      (item) => [
        item._id,
        item.inventoryItem.name,
        item.inventoryItem.sku || "",
        item.type,
        item.quantity,
        item.inventoryItem.unit,
        item.branch.name,
        item.performedBy.name,
        item.transactionDate,
        item.referenceId || "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "inventory-transactions.csv";

    link.click();

    URL.revokeObjectURL(url);

    toast.success(
      "Transactions exported successfully"
    );
  };

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    pagination?.totalPages || 1;

  const total =
    pagination?.totalTransactions || 0;

  const start =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    total
  );

  return (
    <div className="space-y-6 p-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Inventory
            </span>

            <span className="text-muted-foreground">
              /
            </span>

            <span className="font-medium text-foreground">
              Transactions
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Inventory Transactions
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Audit every stock movement across branches
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />

            Export
          </Button>

          <Button
            onClick={() =>
              setFormOpen(true)
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Record Transaction
          </Button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <InventoryTransactionStats
        report={report}
        loading={reportLoading}
      />

      {/* ===================================================== */}
      {/* TABLE CARD */}
      {/* ===================================================== */}

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardContent className="p-0">
          <div className="border-b p-4">
            <InventoryTransactionFilters
              search={search}
              setSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              type={type}
              setType={(value) => {
                setType(value);
                setPage(1);
              }}
              branch={branch}
              setBranch={(value) => {
                setBranch(value);
                setPage(1);
              }}
              branches={branches}
              onReset={handleReset}
            />
          </div>

          <InventoryTransactionTable
            transactions={transactions}
            loading={loading}
            onView={handleView}
          />

          {/* ================================================= */}
          {/* PAGINATION */}
          {/* ================================================= */}

          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {start}
              </span>{" "}
              –{" "}
              <span className="font-medium text-foreground">
                {end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {total}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  page <= 1 || loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        current - 1,
                        1
                      )
                  )
                }
              >
                ← Prev
              </Button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                {page}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={
                  page >= totalPages ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        current + 1,
                        totalPages
                      )
                  )
                }
              >
                Next →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* RECORD TRANSACTION */}
      {/* ===================================================== */}

      <TransactionFormDialog
        open={formOpen}
        items={inventoryItems}
        itemsLoading={inventoryLoading}
        loading={false}
        onOpenChange={
          setFormOpen
        }
        onSubmit={
          handleFormSubmit
        }
      />

      {/* ===================================================== */}
      {/* CONFIRMATION */}
      {/* ===================================================== */}

      <TransactionConfirmDialog
        open={confirmOpen}
        onOpenChange={
          setConfirmOpen
        }
        loading={actionLoading}
        title="Confirm transaction"
        description="Are you sure you want to record this inventory transaction? This action will change the current stock quantity."
        confirmLabel="Confirm & Record"
        onConfirm={
          handleConfirm
        }
      />

      {/* ===================================================== */}
      {/* DETAILS */}
      {/* ===================================================== */}

      <TransactionDetailsDialog
        open={detailsOpen}
        transaction={
          selectedTransaction
        }
        loading={
          detailsLoading
        }
        onOpenChange={
          setDetailsOpen
        }
      />
    </div>
  );
}