"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  RootState,
  AppDispatch,
} from "@/redux/store/store";

import {
  getMenuCategories,
  getMenuCategoryById,
  createMenuCategory,
  updateMenuCategory,
  activateMenuCategory,
  deactivateMenuCategory,
  softDeleteMenuCategory,
} from "@/redux/slice/menuCategorySlice";
import { getRestaurants } from "@/redux/slice/restaurentSlice";

import {
  MenuCategory,
} from "@/types/menuCategory";

import MenuCategoryCard from "./MenuCategoryCard";
import MenuCategoryFilters from "./MenuCategoryFilters";
import MenuCategoryFormDialog from "./MenuCategoryFormDialog";
import MenuCategoryViewDialog from "./MenuCategoryViewDialog";
import MenuCategoryConfirmationDialog from "./MenuCategoryConfirmationDialog";
import MenuCategorySkeleton from "./MenuCategorySkeleton";

interface Props {
  branchId?: string;
}

interface BranchOption {
  _id: string;
  name: string;
}

type ConfirmationType =
  | "activate"
  | "deactivate"
  | "delete"
  | null;

export default function MenuCategoryPage({
  branchId = "all",
}: Props) {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    categories,
    selectedCategory,
    loading,
    getByIdLoading,
    createLoading,
    updateLoading,
    actionLoading,
    deleteLoading,
    pagination,
  } = useSelector(
    (state: RootState) =>
      state.menuCategory
  );

  const restaurants = useSelector(
    (state: RootState) =>
      state.restaurant.restaurants
  );

  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<string>("");
  const [selectedBranchId, setSelectedBranchId] =
    useState<string>(branchId || "all");
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<MenuCategory | null>(null);

  const [viewOpen, setViewOpen] =
    useState(false);

  const [confirmationOpen, setConfirmationOpen] =
    useState(false);

  const [confirmationType, setConfirmationType] =
    useState<ConfirmationType>(null);

  const [actionCategory, setActionCategory] =
    useState<MenuCategory | null>(null);

  const activeRestaurantId =
    selectedRestaurantId || restaurants[0]?._id || "";

  const canCreateCategory = !!activeRestaurantId;

  // ============================================================
  // FETCH
  // ============================================================

  useEffect(() => {
    if (restaurants.length === 0) {
      dispatch(getRestaurants());
    }
  }, [dispatch, restaurants.length]);

  useEffect(() => {
    if (!activeRestaurantId) {
      return;
    }

    const loadBranches = async () => {
      setBranchLoading(true);

      try {
        const response = await axiosInstance.get<{
          data?: BranchOption[];
        }>(endpoints.branch.getByRestaurantId(activeRestaurantId));

        setBranchOptions(response.data?.data ?? []);

        if (
          branchId &&
          response.data?.data?.some(
            (branch) => branch._id === branchId
          )
        ) {
          setSelectedBranchId(branchId);
        } else {
          setSelectedBranchId("all");
        }
      } catch {
        setBranchOptions([]);
        setSelectedBranchId("all");
      } finally {
        setBranchLoading(false);
      }
    };

    loadBranches();
  }, [activeRestaurantId, branchId]);

  useEffect(() => {
    const effectiveBranchId =
      selectedBranchId || "all";

    const allBranchIds =
      effectiveBranchId === "all"
        ? branchOptions
            .map((branch) => branch._id)
            .filter(Boolean)
        : undefined;

    dispatch(
      getMenuCategories({
        branchId: effectiveBranchId,
        restaurantId:
          activeRestaurantId || undefined,
        branchIds: allBranchIds,
        page,
        limit: 12,
        search,
        ...(status !== "all"
          ? {
              isActive:
                status === "active",
            }
          : {}),
      })
    );
  }, [
    dispatch,
    activeRestaurantId,
    selectedBranchId,
    branchOptions,
    page,
    search,
    status,
  ]);

  // ============================================================
  // TOTAL MENU ITEMS
  // ============================================================

  const totalMenuItems = useMemo(() => {
    return categories.reduce(
      (total: number, category: MenuCategory) =>
        total +
        (category.menuItemCount || 0),
      0
    );
  }, [categories]);

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const handleCreate = () => {
    if (!canCreateCategory) {
      return;
    }

    if (!selectedBranchId || selectedBranchId === "all") {
      const fallbackBranchId =
        branchOptions[0]?._id || "";

      if (fallbackBranchId) {
        setSelectedBranchId(fallbackBranchId);
      }
    }

    setEditingCategory(null);
    setFormOpen(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleEdit = (
    category: MenuCategory
  ) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  // ============================================================
  // VIEW
  // ============================================================

  const handleView = async (
    category: MenuCategory
  ) => {
    setViewOpen(true);

    await dispatch(
      getMenuCategoryById(
        category._id
      )
    );
  };

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleFormSubmit = async (
    values: {
      name: string;
      description: string;
      displayOrder: number;
      isActive: boolean;
      image: File | null;
    }
  ) => {
    const targetBranchId =
      selectedBranchId === "all"
        ? branchOptions[0]?._id || ""
        : selectedBranchId;

    if (!targetBranchId) {
      return;
    }

    const formData = new FormData();

    formData.append(
      "name",
      values.name
    );

    formData.append(
      "description",
      values.description
    );

    formData.append(
      "displayOrder",
      String(values.displayOrder)
    );

    formData.append(
      "isActive",
      String(values.isActive)
    );

    if (values.image) {
      formData.append(
        "image",
        values.image
      );
    }

    let result;

    if (editingCategory) {
      result = await dispatch(
        updateMenuCategory({
          id: editingCategory._id,
          formData,
        })
      );
    } else {
      result = await dispatch(
        createMenuCategory({
          branchId: targetBranchId,
          formData,
        })
      );
    }

    if (
      result &&
      (updateMenuCategory.fulfilled.match(result) ||
        createMenuCategory.fulfilled.match(result))
    ) {
      setFormOpen(false);
      setEditingCategory(null);

      dispatch(
        getMenuCategories({
          branchId:
            selectedBranchId === "all"
              ? "all"
              : selectedBranchId,
          restaurantId: restaurants[0]?._id,
          page,
          limit: 12,
          search,
          ...(status !== "all"
            ? {
                isActive:
                  status === "active",
              }
            : {}),
        })
      );
    }
  };

  // ============================================================
  // CONFIRMATION
  // ============================================================

  const openConfirmation = (
    type: ConfirmationType,
    category: MenuCategory
  ) => {
    setConfirmationType(type);
    setActionCategory(category);
    setConfirmationOpen(true);
  };

  // ============================================================
  // CONFIRM ACTION
  // ============================================================

  const handleConfirmation = async () => {
    if (
      !actionCategory ||
      !confirmationType
    ) {
      return;
    }

    let result;

    switch (confirmationType) {
      case "activate":
        result = await dispatch(
          activateMenuCategory(
            actionCategory._id
          )
        );
        break;

      case "deactivate":
        result = await dispatch(
          deactivateMenuCategory(
            actionCategory._id
          )
        );
        break;

      case "delete":
        result = await dispatch(
          softDeleteMenuCategory(
            actionCategory._id
          )
        );
        break;
    }

    if (
      result &&
      result.meta.requestStatus === "fulfilled"
    ) {
      setConfirmationOpen(false);
      setActionCategory(null);
      setConfirmationType(null);

      dispatch(
        getMenuCategories({
          branchId:
            selectedBranchId === "all"
              ? "all"
              : selectedBranchId,
          restaurantId: restaurants[0]?._id,
          page,
          limit: 12,
          search,
          ...(status !== "all"
            ? {
                isActive:
                  status === "active",
              }
            : {}),
        })
      );
    }
  };

  // ============================================================
  // CONFIRMATION CONTENT
  // ============================================================

  const confirmationContent = {
    activate: {
      title: "Activate category?",
      description: `Are you sure you want to activate "${actionCategory?.name}"?`,
      confirmText: "Activate",
      destructive: false,
    },

    deactivate: {
      title: "Deactivate category?",
      description: `Are you sure you want to deactivate "${actionCategory?.name}"?`,
      confirmText: "Deactivate",
      destructive: false,
    },

    delete: {
      title: "Delete category?",
      description: `Are you sure you want to delete "${actionCategory?.name}"? This category will be moved to deleted state.`,
      confirmText: "Delete",
      destructive: true,
    },
  };

  const confirmation =
    confirmationType
      ? confirmationContent[
          confirmationType
        ]
      : null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full bg-[#f7f8f8] p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Menu Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize items and control menu availability
          </p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={!canCreateCategory}
          className="bg-[#8b632f] hover:bg-[#765329] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>

      {/* MAIN CARD */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {/* FILTER */}
          <MenuCategoryFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            total={pagination.total}
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId || activeRestaurantId}
            onRestaurantChange={(value) => {
              setSelectedRestaurantId(value || "");
              setSelectedBranchId("all");
              setBranchOptions([]);
              setPage(1);
            }}
            selectedBranchId={selectedBranchId}
            onBranchChange={(value) => {
              setSelectedBranchId(value || "all");
              setPage(1);
            }}
            branchOptions={branchOptions}
            branchLoading={branchLoading}
          />

          {/* SUMMARY */}
          <div className="flex items-center justify-end border-b border-slate-100 px-5 py-3">
            <p className="text-sm text-slate-500">
              {pagination.total} categories ·{" "}
              {totalMenuItems} menu items
            </p>
          </div>

          {/* GRID */}
          <div className="p-5">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <MenuCategorySkeleton
                    key={index}
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <FolderOpen className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No categories found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try changing your search or create
                  your first menu category.
                </p>

                <Button
                  onClick={handleCreate}
                  disabled={!canCreateCategory}
                  className="mt-5 bg-[#8b632f] hover:bg-[#765329] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add category
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map(
                  (category: MenuCategory) => (
                    <div
                      key={category._id}
                      className="relative"
                    >
                      <MenuCategoryCard
                        category={category}
                        onView={handleView}
                        onEdit={handleEdit}
                        onActivate={(item) =>
                          openConfirmation(
                            "activate",
                            item
                          )
                        }
                        onDeactivate={(item) =>
                          openConfirmation(
                            "deactivate",
                            item
                          )
                        }
                        onDelete={(item) =>
                          openConfirmation(
                            "delete",
                            item
                          )
                        }
                      />

                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        current - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT */}
      <MenuCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        loading={
          createLoading ||
          updateLoading
        }
        onSubmit={handleFormSubmit}
      />

      {/* VIEW */}
      <MenuCategoryViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        category={selectedCategory}
        loading={getByIdLoading}
      />

      {/* CONFIRMATION */}
      {confirmation && (
        <MenuCategoryConfirmationDialog
          open={confirmationOpen}
          onOpenChange={
            setConfirmationOpen
          }
          title={confirmation.title}
          description={
            confirmation.description
          }
          confirmText={
            confirmation.confirmText
          }
          destructive={
            confirmation.destructive
          }
          loading={
            actionLoading ||
            deleteLoading
          }
          onConfirm={
            handleConfirmation
          }
        />
      )}
    </div>
  );
}