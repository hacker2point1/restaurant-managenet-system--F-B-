"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserFilters from "@/src/components/users/user-filters";
import UserFormDialog, { type UserFormData } from "@/src/components/users/user-form-dialog";
import UserTable from "@/src/components/users/user-table";
import UserTableSkeleton from "@/src/components/users/user-table-skeleton";
import {
  activateUser,
  createUser,
  deactivateUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/redux/slice/userSlice";
import type { AppDispatch, RootState } from "@/redux/store/store";
import type { User, UserRole, UserStatus } from "@/types/user";

const PAGE_SIZE = 10;

interface PendingUserAction {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

export default function UsersPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    currentPage,
    totalPages,
    totalUsers,
    loading,
    actionLoading,
    error,
  } = useSelector((state: RootState) => state.user);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogSession, setDialogSession] = useState(0);
  const [confirmation, setConfirmation] =
    useState<PendingUserAction | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    dispatch(
      getUsers({
        page,
        limit: PAGE_SIZE,
        search,
        role,
        status,
      })
    );
  }, [dispatch, page, search, role, status]);

  const refreshUsers = async () => {
    await dispatch(
      getUsers({ page, limit: PAGE_SIZE, search, role, status })
    );
  };

  const requestUserAction = (
    user: User,
    action: "activate" | "deactivate" | "delete"
  ) => {
    const userLabel = user.name || user.email || "this user";
    const actionDetails = {
      activate: {
        title: "Activate user?",
        description: `Activate ${userLabel} and allow them to access the system?`,
        confirmLabel: "Activate",
        destructive: false,
        onConfirm: async () => {
          await dispatch(activateUser(user._id)).unwrap();
          await refreshUsers();
        },
      },
      deactivate: {
        title: "Deactivate user?",
        description: `Deactivate ${userLabel}? They will no longer be able to access the system.`,
        confirmLabel: "Deactivate",
        destructive: false,
        onConfirm: async () => {
          await dispatch(deactivateUser(user._id)).unwrap();
          await refreshUsers();
        },
      },
      delete: {
        title: "Delete user?",
        description: `Delete ${userLabel}? This action cannot be undone.`,
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: async () => {
          await dispatch(deleteUser(user._id)).unwrap();
          await refreshUsers();
        },
      },
    } satisfies Record<typeof action, Omit<PendingUserAction, "onConfirm"> & { onConfirm: () => Promise<void> }>;

    setConfirmation(actionDetails[action]);
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setDialogSession((session) => session + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setDialogSession((session) => session + 1);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    const userToUpdate = selectedUser;

    setConfirmation({
      title: userToUpdate ? "Save user changes?" : "Create user?",
      description: userToUpdate
        ? `Save the updated details for ${userToUpdate.name || userToUpdate.email}?`
        : `Create ${data.name} with the ${data.role} role?`,
      confirmLabel: userToUpdate ? "Save changes" : "Create user",
      destructive: false,
      onConfirm: async () => {
        if (userToUpdate) {
          await dispatch(
            updateUser({
              id: userToUpdate._id,
              data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
              },
            })
          ).unwrap();
        } else {
          await dispatch(createUser(data)).unwrap();
        }

        setConfirmation(null);
        setDialogOpen(false);
        setSelectedUser(null);
        await refreshUsers();
      },
    });
  };

  const confirmUserAction = async () => {
    if (!confirmation || isConfirming) {
      return;
    }

    setIsConfirming(true);
    try {
      await confirmation.onConfirm();
      setConfirmation(null);
    } catch {
      // The user slice displays operation errors.
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading && users.length === 0) {
    return <UserTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage accounts, roles, and access.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="self-start bg-[#8b642d] text-white hover:bg-[#765323] sm:self-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add user
        </Button>
      </header>

      {error && users.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-white p-8 text-center">
          <AlertCircle className="h-9 w-9 text-red-500" />
          <div>
            <h2 className="font-semibold text-slate-900">Unable to load users</h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <Button variant="outline" onClick={refreshUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">All users</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {totalUsers.toLocaleString()} total
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshUsers}
              disabled={loading || actionLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <UserFilters
            search={search}
            role={role}
            status={status}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onRoleChange={(value) => {
              setRole(value as UserRole | "all");
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatus(value as UserStatus | "all");
              setPage(1);
            }}
            onClear={() => {
              setSearch("");
              setRole("all");
              setStatus("all");
              setPage(1);
            }}
          />

          {loading && users.length === 0 ? (
            <UserTableSkeleton />
          ) : (
            <UserTable
              users={users}
              onEdit={openEditDialog}
              onActivate={(user) => requestUserAction(user, "activate")}
              onDeactivate={(user) => requestUserAction(user, "deactivate")}
              onDelete={(user) => requestUserAction(user, "delete")}
            />
          )}

          <footer className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {currentPage || page} of {Math.max(totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </section>
      )}

      <UserFormDialog
        key={dialogSession}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
        user={selectedUser}
        loading={actionLoading}
        onSubmit={handleFormSubmit}
      />

      <Dialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !isConfirming) {
            setConfirmation(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={!isConfirming}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription>
              {confirmation?.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isConfirming}
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmation?.destructive ? "destructive" : "default"}
              disabled={isConfirming}
              onClick={confirmUserAction}
            >
              {isConfirming ? "Working..." : confirmation?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}