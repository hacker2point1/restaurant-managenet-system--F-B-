
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Download, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createCustomer,
  fetchCustomers,
  fetchDeletedCustomers,
  hardDeleteCustomer,
  restoreCustomer,
  softDeleteCustomer,
  updateCustomer,
} from "@/redux/slice/customerSlice";

import type {
  Customer,
  CustomerFormData,
} from "@/types/customer";
import { Button } from "@base-ui/react";
import { CustomerStats } from "@/src/components/customer/customer-stats";
import { Card } from "@/components/ui/card";
import { CustomerFilters } from "@/src/components/customer/customer-filters";
import { DeletedCustomersTable } from "@/src/components/customer/deleted-customers-table";
import { CustomersTable } from "@/src/components/customer/customers-table";
import { CustomerPagination } from "@/src/components/customer/customer-pagination";
import { CustomerFormDialog } from "@/src/components/customer/customer-form-dialog";
import { CustomerDetailsDialog } from "@/src/components/customer/customer-details-dialog";
import { CustomerConfirmDialog } from "@/src/components/customer/customer-confirm-dialog";



type ConfirmAction =
  | "delete"
  | "restore"
  | "permanentDelete"
  | "toggleStatus";

interface ConfirmState {
  action: ConfirmAction;
  customer: Customer;
}

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const dispatch = useAppDispatch();

  const {
    customers,
    deletedCustomers,
    selectedCustomer,
    pagination,
    deletedPagination,
    loading,
    deletedLoading,
    submitting,
    error,
  } = useAppSelector((state) => state.customer);

  // Adjust this selector if your auth slice uses a different user property.
  const isAdmin = useAppSelector((state) => {
    const auth = state.auth as {
      user?: { role?: string };
      currentUser?: { role?: string };
    };
    return (auth.user?.role ?? auth.currentUser?.role) === "admin";
  });

  const [recycleBin, setRecycleBin] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [exporting, setExporting] = useState(false);

  // Debounce search so we don't request the API for every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCustomers = useCallback(() => {
    const query = {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      isActive:
        status === "all" ? undefined : status === "active",
    };

    if (recycleBin) {
      dispatch(fetchDeletedCustomers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }));
    } else {
      dispatch(fetchCustomers(query));
    }
  }, [dispatch, page, debouncedSearch, status, recycleBin]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const currentPagination = recycleBin ? deletedPagination : pagination;
  const isLoading = recycleBin ? deletedLoading : loading;

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: CustomerFormData) {
    try {
      if (editingCustomer) {
        await dispatch(updateCustomer({
          id: editingCustomer._id,
          data,
        })).unwrap();
        toast.success("Customer updated successfully.");
      } else {
        await dispatch(createCustomer(data)).unwrap();
        toast.success("Customer created successfully.");
      }

      setFormOpen(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not save customer.");
      throw err;
    }
  }

  async function runConfirmedAction() {
    if (!confirm) return;

    const { action, customer } = confirm;

    try {
      switch (action) {
        case "delete":
          await dispatch(softDeleteCustomer(customer._id)).unwrap();
          toast.success("Customer moved to the Recycle Bin.");
          break;

        case "restore":
          await dispatch(restoreCustomer(customer._id)).unwrap();
          toast.success("Customer restored successfully.");
          break;

        case "permanentDelete":
          await dispatch(hardDeleteCustomer(customer._id)).unwrap();
          toast.success("Customer permanently deleted.");
          break;

        case "toggleStatus":
          await dispatch(updateCustomer({
            id: customer._id,
            data: {
              name: customer.name,
              email: customer.email ?? "",
              phone: customer.phone ?? "",
              street: customer.address?.street ?? "",
              city: customer.address?.city ?? "",
              state: customer.address?.state ?? "",
              country: customer.address?.country ?? "",
              zipCode: customer.address?.zipCode ?? "",
              loyaltyPoints: String(customer.loyaltyPoints ?? 0),
              isActive: !customer.isActive,
            },
          })).unwrap();

          toast.success(
            customer.isActive
              ? "Customer deactivated."
              : "Customer activated."
          );
          break;
      }

      setConfirm(null);
      loadCustomers();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "The action failed.");
    }
  }

  function confirmationContent() {
    if (!confirm) {
      return {
        title: "",
        description: "",
        confirmText: "Confirm",
        destructive: false,
      };
    }

    const name = confirm.customer.name;

    switch (confirm.action) {
      case "delete":
        return {
          title: "Move customer to Recycle Bin?",
          description: `${name} will be removed from the active customer list. You can restore this customer later.`,
          confirmText: "Move to Recycle Bin",
          destructive: true,
        };

      case "restore":
        return {
          title: "Restore customer?",
          description: `${name} will be restored to the active customer list.`,
          confirmText: "Restore",
          destructive: false,
        };

      case "permanentDelete":
        return {
          title: "Permanently delete customer?",
          description: `This will permanently delete ${name}. This action cannot be undone.`,
          confirmText: "Delete permanently",
          destructive: true,
        };

      case "toggleStatus":
        return {
          title: customerStatusTitle(confirm.customer.isActive),
          description: confirm.customer.isActive
            ? `Deactivate ${name}? They will remain in your customer records, but their status will become inactive.`
            : `Activate ${name}? Their status will become active again.`,
          confirmText: confirm.customer.isActive ? "Deactivate" : "Activate",
          destructive: confirm.customer.isActive,
        };
    }
  }

  function customerStatusTitle(isActive: boolean) {
    return isActive ? "Deactivate customer?" : "Activate customer?";
  }

  async function exportCustomers() {
    setExporting(true);

    try {
      // Fetch all matching records for export, not just the visible page.
      const result = await dispatch(fetchCustomers({
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
        isActive: status === "all" ? undefined : status === "active",
      })).unwrap();

      const rows = [
        ["Name", "Email", "Phone", "Total Visits", "Total Spent", "Loyalty Points", "Status"],
        ...result.data.map((customer) => [
          customer.name,
          customer.email ?? "",
          customer.phone ?? "",
          String(customer.totalVisits ?? 0),
          String(customer.totalSpent ?? 0),
          String(customer.loyaltyPoints ?? 0),
          customer.isActive ? "Active" : "Inactive",
        ]),
      ];

      const csv = rows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n");

      const url = URL.createObjectURL(
        new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "customers.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Customer export downloaded.");
    } catch {
      toast.error("Unable to export customers.");
    } finally {
      setExporting(false);
      loadCustomers();
    }
  }

  const confirmContent = confirmationContent();

  return (
    <div className="min-h-full space-y-6 bg-[#F6F7F7] p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Customers</span>
            <span>/</span>
            <span className="text-foreground">
              {recycleBin ? "Recycle Bin" : "All Customers"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#192322]">
            {recycleBin ? "Deleted Customers" : "Customers"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {recycleBin
              ? `${deletedPagination.total} deleted customers`
              : `${pagination.total} customers`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!recycleBin && (
            <>
              <Button
                variant="outline"
                onClick={exportCustomers}
                disabled={exporting}
              >
                {exporting
                  ? <Loader2 className="mr-2 size-4 animate-spin" />
                  : <Download className="mr-2 size-4" />}
                Export
              </Button>
              <Button
                onClick={openCreate}
                className="bg-[#8B642F] text-white hover:bg-[#765326]"
              >
                <Plus className="mr-2 size-4" />
                Add Customer
              </Button>
            </>
          )}
        </div>
      </div>

      {!recycleBin && (
        <CustomerStats
          customers={customers}
          total={pagination.total}
        />
      )}

      <Card className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <CustomerFilters
          search={search}
          status={status}
          recycleBin={recycleBin}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onRecycleBin={() => {
            setRecycleBin((current) => !current);
            setSearch("");
            setDebouncedSearch("");
            setPage(1);
          }}
        />

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading customers...
          </div>
        ) : (
          <>
            {recycleBin ? (
              <DeletedCustomersTable
                customers={deletedCustomers}
                isAdmin={isAdmin}
                onRestore={(customer) => setConfirm({ action: "restore", customer })}
                onPermanentDelete={(customer) =>
                  setConfirm({ action: "permanentDelete", customer })
                }
              />
            ) : (
              <CustomersTable
                customers={customers}
                search={debouncedSearch}
                onView={(customer) => {
                  setViewingCustomer(customer);
                  setDetailsOpen(true);
                }}
                onEdit={openEdit}
                onDelete={(customer) => setConfirm({ action: "delete", customer })}
                onToggleStatus={(customer) =>
                  setConfirm({ action: "toggleStatus", customer })
                }
              />
            )}

            <CustomerPagination
              page={currentPagination.page}
              totalPages={currentPagination.totalPages}
              total={currentPagination.total}
              limit={currentPagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <CustomerFormDialog
        open={formOpen}
        customer={editingCustomer}
        loading={submitting}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCustomer(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <CustomerDetailsDialog
        customer={viewingCustomer ?? selectedCustomer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <CustomerConfirmDialog
        open={Boolean(confirm)}
        loading={submitting}
        title={confirmContent.title}
        description={confirmContent.description}
        confirmText={confirmContent.confirmText}
        destructive={confirmContent.destructive}
        onOpenChange={(open) => {
          if (!open && !submitting) setConfirm(null);
        }}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
}
