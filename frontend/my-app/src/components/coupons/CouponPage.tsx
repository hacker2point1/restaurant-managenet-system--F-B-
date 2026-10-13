"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { fetchBranches } from "@/redux/slice/branchSlice";
import {
    activateCoupon,
    createCoupon,
    deactivateCoupon,
    deleteCoupon,
    getCouponById,
    getCoupons,
    getDeletedCoupons,
    permanentlyDeleteCoupon,
    restoreCoupon,
    updateCoupon,
} from "@/redux/slice/couponSlice";
import { getRestaurants } from "@/redux/slice/restaurentSlice";
import { searchCustomers } from "@/redux/slice/reservationSlice";
import { RootState } from "@/redux/store/store";
import CouponFormDialog from "@/src/components/coupons/CouponFormDialog";
import CouponTable from "@/src/components/coupons/CouponTable";
import CouponDetailsDialog from "@/src/components/coupons/CouponDetailsDialog";
import { BranchConfirmationDialog } from "@/src/components/branches/BranchConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Coupon, CouponQuery, CouponSubmitData } from "@/types/coupon";
import type { Branch } from "@/types/branch";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    MapPin,
    Plus,
    RotateCcw,
    Search,
    Store,
    Trash2,
    TicketPercent,
} from "lucide-react";

const ALL_RESTAURANTS = "all";
const ALL_BRANCHES = "all";
const ALL_STATUSES = "all";
const ALL_AUDIENCES = "all";
const COUPON_PAGE_SIZE = 10;

type CouponStatusFilter = "all" | "active" | "inactive";
type CouponAudienceFilterOption = "all" | "all-customers" | "specific";

type CouponBranchOption = Branch & {
    restaurantId: string;
    restaurantName: string;
};

type PendingCouponAction = {
    type: "deactivate" | "delete" | "permanentDelete";
    coupon: Coupon;
};

const getErrorMessage = (error: unknown) =>
    typeof error === "string"
        ? error
        : error instanceof Error
            ? error.message
            : "The coupon action failed.";

export default function CouponsPage() {
    const dispatch = useAppDispatch();
    const restaurants = useAppSelector(
        (state: RootState) => state.restaurant.restaurants
    );

    const restaurantLoading = useAppSelector(
        (state: RootState) =>
            state.restaurant.loading
    );

    const branches = useAppSelector(
        (state: RootState) =>
            state.branch.branches
    );

    const branchLoading = useAppSelector(
        (state: RootState) =>
            state.branch.loading
    );

    const coupons = useAppSelector(
        (state: RootState) =>
            state.coupon.coupons
    );

    const couponPagination = useAppSelector(
        (state: RootState) => state.coupon.pagination
    );

    const couponsLoading = useAppSelector(
        (state: RootState) =>
            state.coupon.loading
    );

    const actionLoading = useAppSelector(
        (state: RootState) =>
            state.coupon.actionLoading
    );

    const detailsLoading = useAppSelector(
        (state: RootState) =>
            state.coupon.detailsLoading
    );

    const customers = useAppSelector(
        (state: RootState) =>
            state.reservation.customers
    );

    const [selectedRestaurantId, setSelectedRestaurantId] =
        useState(ALL_RESTAURANTS);
    const [selectedBranchId, setSelectedBranchId] =
        useState(ALL_BRANCHES);
    const [selectedStatus, setSelectedStatus] =
        useState<CouponStatusFilter>(ALL_STATUSES);
    const [selectedAudience, setSelectedAudience] =
        useState<CouponAudienceFilterOption>(ALL_AUDIENCES);
    const [restoreMode, setRestoreMode] = useState(false);
    const [couponSearch, setCouponSearch] = useState("");
    const debouncedCouponSearch = useDebounce(couponSearch, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formBranches, setFormBranches] = useState<CouponBranchOption[]>([]);
    const [formBranchesLoading, setFormBranchesLoading] = useState(false);
    const [formBranchesError, setFormBranchesError] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsCoupon, setDetailsCoupon] = useState<Coupon | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingCouponAction | null>(null);

    const getCouponQuery = useCallback((): CouponQuery => ({
        page: currentPage,
        limit: COUPON_PAGE_SIZE,
        ...(selectedRestaurantId !== ALL_RESTAURANTS && {
            restaurant: selectedRestaurantId,
        }),
        ...(!restoreMode && selectedBranchId !== ALL_BRANCHES && {
            branch: selectedBranchId,
        }),
        ...(!restoreMode && selectedStatus !== ALL_STATUSES && {
            isActive: selectedStatus === "active",
        }),
        ...(!restoreMode && selectedAudience !== ALL_AUDIENCES && {
            audience: selectedAudience,
        }),
        ...(debouncedCouponSearch && {
            search: debouncedCouponSearch,
        }),
    }), [
        selectedRestaurantId,
        selectedBranchId,
        selectedStatus,
        selectedAudience,
        debouncedCouponSearch,
        currentPage,
        restoreMode,
    ]);

    useEffect(() => {
        dispatch(getRestaurants());
        dispatch(searchCustomers(""));
    }, [dispatch]);

    useEffect(() => {
        if (selectedRestaurantId === ALL_RESTAURANTS) {
            return;
        }

        dispatch(fetchBranches(selectedRestaurantId));
    }, [dispatch, selectedRestaurantId]);

    useEffect(() => {
        dispatch(
            restoreMode
                ? getDeletedCoupons(getCouponQuery())
                : getCoupons(getCouponQuery())
        );
    }, [dispatch, getCouponQuery, restoreMode]);

    const handleRestaurantChange = (value: string | null) => {
        const restaurantId = value ?? ALL_RESTAURANTS;
        setSelectedRestaurantId(restaurantId);
        setSelectedBranchId(ALL_BRANCHES);
        setCurrentPage(1);
    };

    const clearCouponFilters = () => {
        setCouponSearch("");
        setSelectedRestaurantId(ALL_RESTAURANTS);
        setSelectedBranchId(ALL_BRANCHES);
        setSelectedStatus(ALL_STATUSES);
        setSelectedAudience(ALL_AUDIENCES);
        setCurrentPage(1);
    };

    const hasActiveCouponFilters =
        Boolean(couponSearch.trim()) ||
        selectedRestaurantId !== ALL_RESTAURANTS ||
        selectedBranchId !== ALL_BRANCHES ||
        selectedStatus !== ALL_STATUSES ||
        selectedAudience !== ALL_AUDIENCES;

    const loadFormBranches = useCallback(async (restaurantId?: string) => {
        setFormBranches([]);
        setFormBranchesError(null);
        setFormBranchesLoading(true);

        const restaurantIds = restaurantId
            ? [restaurantId]
            : selectedRestaurantId === ALL_RESTAURANTS
                ? restaurants.map((restaurant) => restaurant._id)
                : [selectedRestaurantId];

        try {
            const results = await Promise.all(
                restaurantIds.map(async (id) => ({
                    restaurantId: id,
                    restaurantName:
                        restaurants.find((restaurant) => restaurant._id === id)?.name ?? id,
                    branches: await dispatch(
                        fetchBranches(id)
                    ).unwrap(),
                }))
            );

            setFormBranches(
                results.flatMap(
                    ({ restaurantId: id, restaurantName, branches: restaurantBranches }) =>
                        restaurantBranches
                            .filter((branch) => !branch.isDeleted)
                            .map((branch) => ({
                                ...branch,
                                restaurantId: id,
                                restaurantName,
                            }))
                )
            );
        } catch (error) {
            setFormBranchesError(
                getErrorMessage(error)
            );
            toast.error(getErrorMessage(error));
        } finally {
            setFormBranchesLoading(false);
        }
    }, [dispatch, restaurants, selectedRestaurantId]);

    const runCouponAction = async (
        request: () => Promise<unknown>,
        successMessage: string
    ) => {
        try {
            await request();
            toast.success(successMessage);
            const refreshResult = restoreMode
                ? await dispatch(getDeletedCoupons(getCouponQuery()))
                : await dispatch(getCoupons(getCouponQuery()));
            const refreshFailed = restoreMode
                ? getDeletedCoupons.rejected.match(refreshResult)
                : getCoupons.rejected.match(refreshResult);
            if (refreshFailed) {
                toast.error(
                    typeof refreshResult.payload === "string"
                        ? refreshResult.payload
                        : "Could not refresh the coupon list."
                );
            }
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error));
            return false;
        }
    };

    const handleOpenForm = useCallback(async () => {
        setEditingCoupon(null);
        setFormOpen(true);
        await loadFormBranches();
    }, [loadFormBranches]);

    const handleView = async (coupon: Coupon) => {
        setDetailsCoupon(coupon);
        setDetailsOpen(true);

        try {
            const fullCoupon = await dispatch(
                getCouponById(coupon._id)
            ).unwrap();
            setDetailsCoupon(fullCoupon);
        } catch (error) {
            toast.error(getErrorMessage(error));
            setDetailsOpen(false);
        }
    };

    const handleEdit = async (coupon: Coupon) => {
        const restaurantId =
            typeof coupon.restaurant === "string"
                ? coupon.restaurant
                : coupon.restaurant?._id;

        if (!restaurantId) {
            toast.error("This coupon is not associated with a restaurant.");
            return;
        }

        setEditingCoupon(coupon);
        setFormOpen(true);
        await loadFormBranches(restaurantId);
    };

    const handleDelete = (coupon: Coupon) => {
        setPendingAction({ type: "delete", coupon });
    };

    const handleActivate = async (coupon: Coupon) => {
        await runCouponAction(
            () => dispatch(activateCoupon(coupon._id)).unwrap(),
            `Coupon ${coupon.code} activated.`
        );
    };

    const handleDeactivate = (coupon: Coupon) => {
        setPendingAction({ type: "deactivate", coupon });
    };

    const handleRestore = async (coupon: Coupon) => {
        await runCouponAction(
            () => dispatch(restoreCoupon(coupon._id)).unwrap(),
            `Coupon ${coupon.code} restored.`
        );
    };

    const handlePermanentDelete = (coupon: Coupon) => {
        setPendingAction({ type: "permanentDelete", coupon });
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        const { type, coupon } = pendingAction;
        const action =
            type === "deactivate"
                ? () => dispatch(deactivateCoupon(coupon._id)).unwrap()
                : type === "delete"
                    ? () => dispatch(deleteCoupon(coupon._id)).unwrap()
                    : () => dispatch(permanentlyDeleteCoupon(coupon._id)).unwrap();
        const actionName =
            type === "deactivate"
                ? "deactivated"
                : type === "delete"
                    ? "deleted"
                    : "permanently deleted";

        const succeeded = await runCouponAction(
            action,
            `Coupon ${coupon.code} ${actionName}.`
        );

        if (succeeded) {
            setPendingAction(null);
        }
    };

    const handleSubmit = async (data: CouponSubmitData) => {
        const result = editingCoupon
            ? await dispatch(
                updateCoupon({ id: editingCoupon._id, data })
            )
            : await dispatch(createCoupon(data));

        if (
            (editingCoupon && updateCoupon.fulfilled.match(result)) ||
            (!editingCoupon && createCoupon.fulfilled.match(result))
        ) {
            toast.success(
                editingCoupon
                    ? `Coupon ${editingCoupon.code} updated.`
                    : `Coupon ${data.code} created.`
            );
            const refreshResult = await dispatch(getCoupons(getCouponQuery()));
            if (getCoupons.rejected.match(refreshResult)) {
                toast.error(
                    typeof refreshResult.payload === "string"
                        ? refreshResult.payload
                        : "Could not refresh the coupon list."
                );
            }
            setFormOpen(false);
            setEditingCoupon(null);
        } else {
            const message =
                "payload" in result && typeof result.payload === "string"
                    ? result.payload
                    : "Could not save the coupon.";
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6 p-6">


            {/* ==================== PAGE HEADER ==================== */}
            <div className="space-y-5">
                {/* Main Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Title Section */}
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TicketPercent className="h-5 w-5" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {restoreMode ? "Deleted Coupons" : "Coupons & Discounts"}
                                </h1>

                                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                    {couponPagination?.total ?? coupons.length}{" "}
                                    {(couponPagination?.total ?? coupons.length) === 1
                                        ? "coupon"
                                        : "coupons"}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {restoreMode
                                    ? "Restore deleted coupons or permanently remove them."
                                    : selectedRestaurantId === ALL_RESTAURANTS
                                    ? "Manage discounts and promotional offers across your restaurants."
                                    : `Showing coupons for ${restaurants.find(
                                        (restaurant) =>
                                            restaurant._id === selectedRestaurantId
                                    )?.name ?? "the selected restaurant"
                                    }`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={restoreMode ? "default" : "outline"}
                            onClick={() => {
                                setRestoreMode((mode) => !mode);
                                setCurrentPage(1);
                            }}
                            className="h-10 gap-2 rounded-lg px-4"
                        >
                            {restoreMode ? (
                                <ArrowLeft className="h-4 w-4" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {restoreMode ? "Back to Coupons" : "Recycle Bin"}
                        </Button>
                        {!restoreMode && (
                            <Button
                                onClick={handleOpenForm}
                                disabled={actionLoading || restaurantLoading}
                                className="h-10 gap-2 rounded-lg px-4 shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Create Coupon
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        {/* Coupon code search */}
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={couponSearch}
                                onChange={(event) => {
                                    setCouponSearch(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by coupon code..."
                                aria-label="Search coupons by code"
                                className="h-10 bg-background pl-9"
                            />
                        </div>

                        {/* Restaurant */}
                        <div className="flex-1">
                            <Select
                                value={selectedRestaurantId}
                                onValueChange={handleRestaurantChange}
                                disabled={restaurantLoading}
                            >
                                <SelectTrigger className="h-10 w-full bg-background">
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-muted-foreground" />

                                        <SelectValue placeholder="Select restaurant">
                                            {(value) =>
                                                value === ALL_RESTAURANTS
                                                    ? "All Restaurants"
                                                    : restaurants.find(
                                                        (restaurant) => restaurant._id === value
                                                    )?.name ?? "Select restaurant"
                                            }
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value={ALL_RESTAURANTS}>
                                        All Restaurants
                                    </SelectItem>

                                    {restaurants.map((restaurant) => (
                                        <SelectItem
                                            key={restaurant._id}
                                            value={restaurant._id}
                                        >
                                            {restaurant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!restoreMode && (
                        <>
                        {/* Branch */}
                        <div className="flex-1">
                            <Select
                                value={selectedBranchId}
                                onValueChange={(value) => {
                                    setSelectedBranchId(value ?? ALL_BRANCHES);
                                    setCurrentPage(1);
                                }}
                                disabled={
                                    branchLoading ||
                                    selectedRestaurantId === ALL_RESTAURANTS
                                }
                            >
                                <SelectTrigger className="h-10 w-full bg-background">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />

                                        <SelectValue placeholder="Select branch">
                                            {(value) =>
                                                value === ALL_BRANCHES
                                                    ? "All Branches"
                                                    : branches.find(
                                                        (branch) => branch._id === value
                                                    )?.name ?? "Select branch"
                                            }
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value={ALL_BRANCHES}>
                                        All Branches
                                    </SelectItem>

                                    {branches.map((branch) => (
                                        <SelectItem
                                            key={branch._id}
                                            value={branch._id}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="flex-1">
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => {
                                    setSelectedStatus(
                                        (value as CouponStatusFilter | null) ?? ALL_STATUSES
                                    );
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 w-full bg-background" aria-label="Filter by status">
                                    <SelectValue>
                                        {(value) =>
                                            value === "active"
                                                ? "Active"
                                                : value === "inactive"
                                                    ? "Inactive"
                                                    : "All Statuses"
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Audience */}
                        <div className="flex-1">
                            <Select
                                value={selectedAudience}
                                onValueChange={(value) => {
                                    setSelectedAudience(
                                        (value as CouponAudienceFilterOption | null) ?? ALL_AUDIENCES
                                    );
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 w-full bg-background" aria-label="Filter by audience">
                                    <SelectValue>
                                        {(value) =>
                                            value === "all-customers"
                                                ? "All Customers"
                                                : value === "specific"
                                                    ? "Specific Customers"
                                                    : "All Audiences"
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_AUDIENCES}>All Audiences</SelectItem>
                                    <SelectItem value="all-customers">All Customers</SelectItem>
                                    <SelectItem value="specific">Specific Customers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearCouponFilters}
                            disabled={!hasActiveCouponFilters}
                            className="h-10 w-full shrink-0 gap-2 lg:w-auto"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear filters
                        </Button>
                    </div>
                </div>
            </div>

            <CouponTable
                coupons={coupons}
                loading={couponsLoading}
                restoreMode={restoreMode}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
            />

            {couponPagination && (
                <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {couponPagination.total === 0
                                ? 0
                                : (currentPage - 1) * couponPagination.limit + 1}
                            –{Math.min(
                                currentPage * couponPagination.limit,
                                couponPagination.total
                            )}
                        </span>{" "}
                        of <span className="font-medium text-foreground">{couponPagination.total}</span>
                    </p>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || couponsLoading}
                            onClick={() => setCurrentPage((page) => page - 1)}
                        >
                            <ChevronLeft className="mr-1 size-4" />
                            Previous
                        </Button>
                        <span className="whitespace-nowrap text-sm text-muted-foreground">
                            Page {currentPage} of {Math.max(couponPagination.totalPages, 1)}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                                currentPage >= couponPagination.totalPages || couponsLoading
                            }
                            onClick={() => setCurrentPage((page) => page + 1)}
                        >
                            Next
                            <ChevronRight className="ml-1 size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <CouponFormDialog
                open={formOpen}
                coupon={editingCoupon}
                restaurantId={selectedRestaurantId === ALL_RESTAURANTS ? "" : selectedRestaurantId}
                branches={formBranches}
                branchesLoading={formBranchesLoading}
                branchesError={formBranchesError}
                customers={customers}
                loading={actionLoading}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) {
                        setEditingCoupon(null);
                    }
                }}
                onSubmit={handleSubmit}
            />

            <CouponDetailsDialog
                open={detailsOpen}
                coupon={detailsCoupon}
                loading={detailsLoading}
                onOpenChange={setDetailsOpen}
            />

            <BranchConfirmationDialog
                open={pendingAction !== null}
                onOpenChange={(open) => {
                    if (!open && !actionLoading) {
                        setPendingAction(null);
                    }
                }}
                title={
                    pendingAction?.type === "deactivate"
                        ? "Deactivate coupon?"
                        : pendingAction?.type === "permanentDelete"
                            ? "Permanently delete coupon?"
                            : "Delete coupon?"
                }
                description={
                    pendingAction?.type === "deactivate"
                        ? `Customers will no longer be able to use ${pendingAction.coupon.code}.`
                        : pendingAction?.type === "permanentDelete"
                            ? `${pendingAction.coupon.code} will be permanently removed and cannot be restored.`
                            : `Delete ${pendingAction?.coupon.code ?? "this coupon"}? You can restore it later.`
                }
                confirmText={
                    pendingAction?.type === "deactivate"
                        ? "Deactivate"
                        : pendingAction?.type === "permanentDelete"
                            ? "Permanently Delete"
                            : "Delete"
                }
                loading={actionLoading}
                destructive={pendingAction?.type !== "deactivate"}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
}
