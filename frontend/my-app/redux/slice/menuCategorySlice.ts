"use client";

import axios from "axios";
import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { toast } from "sonner";

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import {
  MenuCategory,
  MenuCategoryActionResponse,
  MenuCategoryListResponse,
  MenuCategoryResponse,
} from "@/types/menuCategory";

// ============================================================
// STATE
// ============================================================

interface MenuCategoryState {
  categories: MenuCategory[];

  selectedCategory: MenuCategory | null;

  loading: boolean;

  getByIdLoading: boolean;

  createLoading: boolean;

  updateLoading: boolean;

  actionLoading: boolean;

  deleteLoading: boolean;

  error: string | null;

  count: number;

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: MenuCategoryState = {
  categories: [],

  selectedCategory: null,

  loading: false,

  getByIdLoading: false,

  createLoading: false,

  updateLoading: false,

  actionLoading: false,

  deleteLoading: false,

  error: null,

  count: 0,

  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
};

// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getMenuCategories = createAsyncThunk<
  MenuCategoryListResponse,
  {
    branchId?: string;
    restaurantId?: string;
    branchIds?: string[];
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  },
  { rejectValue: string }
>(
  "menuCategory/getMenuCategories",

  async (params, thunkAPI) => {
    try {
      const {
        branchId,
        restaurantId,
        branchIds,
        page = 1,
        limit = 12,
        search = "",
        isActive,
      } = params;

      if (!branchId || branchId === "all") {
        let restaurantBranches: string[] = [];

        if (restaurantId) {
          const restaurantResponse = await axiosInstance.get<{
            data?: { branches?: string[] };
            branches?: string[];
          }>(endpoints.restaurant.getById(restaurantId));

          restaurantBranches =
            restaurantResponse.data?.data?.branches ||
            restaurantResponse.data?.branches ||
            [];
        }

        const targetBranchIds =
          branchIds && branchIds.length > 0
            ? branchIds
            : restaurantBranches;

        if (targetBranchIds.length === 0) {
          return {
            status: true,
            message: "No branches available",
            data: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }

        const responses = await Promise.all(
          targetBranchIds.map(async (id) => {
            const response = await axiosInstance.get<MenuCategoryListResponse>(
              endpoints.menuCategory.getAll(id),
              {
                params: {
                  page: 1,
                  limit: 1000,
                  search,
                  ...(isActive !== undefined ? { isActive } : {}),
                },
              }
            );

            return response.data;
          })
        );

        const merged = new Map<string, MenuCategory>();

        responses.forEach((response) => {
          (response.data || []).forEach((category) => {
            merged.set(category._id, category);
          });
        });

        const allCategories = Array.from(merged.values()).sort(
          (first, second) =>
            first.displayOrder - second.displayOrder ||
            (second.createdAt || "").localeCompare(first.createdAt || "")
        );
        const startIndex = (page - 1) * limit;

        return {
          status: true,
          message: "Categories fetched across all branches",
          data: allCategories.slice(startIndex, startIndex + limit),
          pagination: {
            total: allCategories.length,
            page,
            limit,
            totalPages: Math.max(
              1,
              Math.ceil(allCategories.length / limit)
            ),
          },
        };
      }

      const response =
        await axiosInstance.get<MenuCategoryListResponse>(
          endpoints.menuCategory.getAll(branchId),
          {
            params: {
              page,
              limit,
              search,
              ...(isActive !== undefined
                ? { isActive }
                : {}),
            },
          }
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch menu categories"
        )
      );
    }
  }
);

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getMenuCategoryById = createAsyncThunk<
  MenuCategoryResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/getMenuCategoryById",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<MenuCategoryResponse>(
          endpoints.menuCategory.getById(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch menu category"
        )
      );
    }
  }
);

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createMenuCategory = createAsyncThunk<
  MenuCategoryResponse,
  {
    branchId: string;
    formData: FormData;
  },
  { rejectValue: string }
>(
  "menuCategory/createMenuCategory",

  async ({ branchId, formData }, thunkAPI) => {
    try {
      const response =
        await axiosInstance.post<MenuCategoryResponse>(
          endpoints.menuCategory.create(branchId),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create menu category"
        )
      );
    }
  }
);

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateMenuCategory = createAsyncThunk<
  MenuCategoryResponse,
  {
    id: string;
    formData: FormData;
  },
  { rejectValue: string }
>(
  "menuCategory/updateMenuCategory",

  async ({ id, formData }, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<MenuCategoryResponse>(
          endpoints.menuCategory.update(id),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update menu category"
        )
      );
    }
  }
);

// ============================================================
// SOFT DELETE
// ============================================================

export const softDeleteMenuCategory = createAsyncThunk<
  MenuCategoryActionResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/softDelete",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<MenuCategoryActionResponse>(
          endpoints.menuCategory.softDelete(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete menu category"
        )
      );
    }
  }
);

// ============================================================
// ACTIVATE
// ============================================================

export const activateMenuCategory = createAsyncThunk<
  MenuCategoryActionResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/activate",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<MenuCategoryActionResponse>(
          endpoints.menuCategory.activate(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to activate menu category"
        )
      );
    }
  }
);

// ============================================================
// DEACTIVATE
// ============================================================

export const deactivateMenuCategory = createAsyncThunk<
  MenuCategoryActionResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/deactivate",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<MenuCategoryActionResponse>(
          endpoints.menuCategory.deactivate(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to deactivate menu category"
        )
      );
    }
  }
);

// ============================================================
// RESTORE
// ============================================================

export const restoreMenuCategory = createAsyncThunk<
  MenuCategoryActionResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/restore",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<MenuCategoryActionResponse>(
          endpoints.menuCategory.restore(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to restore menu category"
        )
      );
    }
  }
);

// ============================================================
// HARD DELETE
// ============================================================

export const hardDeleteMenuCategory = createAsyncThunk<
  MenuCategoryActionResponse,
  string,
  { rejectValue: string }
>(
  "menuCategory/hardDelete",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.delete<MenuCategoryActionResponse>(
          endpoints.menuCategory.hardDelete(id)
        );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to permanently delete menu category"
        )
      );
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const menuCategorySlice = createSlice({
  name: "menuCategory",

  initialState,

  reducers: {
    clearMenuCategoryError: (state) => {
      state.error = null;
    },

    clearSelectedMenuCategory: (state) => {
      state.selectedCategory = null;
    },

    resetMenuCategories: (state) => {
      state.categories = [];
      state.selectedCategory = null;
      state.count = 0;

      state.pagination = {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      };
    },
  },

  extraReducers: (builder) => {
    // ========================================================
    // GET ALL
    // ========================================================

    builder
      .addCase(
        getMenuCategories.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getMenuCategories.fulfilled,
        (state, action) => {
          state.loading = false;

          if (action.payload.status) {
            state.categories =
              action.payload.data || [];

            state.count =
              action.payload.pagination?.total ||
              0;

            state.pagination =
              action.payload.pagination;
          }
        }
      )

      .addCase(
        getMenuCategories.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch menu categories";

          toast.error(state.error);
        }
      );

    // ========================================================
    // GET BY ID
    // ========================================================

    builder
      .addCase(
        getMenuCategoryById.pending,
        (state) => {
          state.getByIdLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getMenuCategoryById.fulfilled,
        (state, action) => {
          state.getByIdLoading = false;

          if (action.payload.status) {
            state.selectedCategory =
              action.payload.data;
          }
        }
      )

      .addCase(
        getMenuCategoryById.rejected,
        (state, action) => {
          state.getByIdLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch menu category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // CREATE
    // ========================================================

    builder
      .addCase(
        createMenuCategory.pending,
        (state) => {
          state.createLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createMenuCategory.fulfilled,
        (state, action) => {
          state.createLoading = false;

          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category created successfully"
            );
          }
        }
      )

      .addCase(
        createMenuCategory.rejected,
        (state, action) => {
          state.createLoading = false;

          state.error =
            action.payload ||
            "Failed to create menu category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // UPDATE
    // ========================================================

    builder
      .addCase(
        updateMenuCategory.pending,
        (state) => {
          state.updateLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateMenuCategory.fulfilled,
        (state, action) => {
          state.updateLoading = false;

          if (action.payload.status) {
            state.selectedCategory =
              action.payload.data;

            toast.success(
              action.payload.message ||
                "Category updated successfully"
            );
          }
        }
      )

      .addCase(
        updateMenuCategory.rejected,
        (state, action) => {
          state.updateLoading = false;

          state.error =
            action.payload ||
            "Failed to update category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // ACTIONS
    // ========================================================

    builder
      .addCase(
        activateMenuCategory.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        activateMenuCategory.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category activated successfully"
            );
          }
        }
      )

      .addCase(
        activateMenuCategory.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to activate category";

          toast.error(state.error);
        }
      )

      .addCase(
        deactivateMenuCategory.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        deactivateMenuCategory.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category deactivated successfully"
            );
          }
        }
      )

      .addCase(
        deactivateMenuCategory.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to deactivate category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // SOFT DELETE
    // ========================================================

    builder
      .addCase(
        softDeleteMenuCategory.pending,
        (state) => {
          state.deleteLoading = true;
        }
      )

      .addCase(
        softDeleteMenuCategory.fulfilled,
        (state, action) => {
          state.deleteLoading = false;

          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category deleted successfully"
            );
          }
        }
      )

      .addCase(
        softDeleteMenuCategory.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.error =
            action.payload ||
            "Failed to delete category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // RESTORE
    // ========================================================

    builder
      .addCase(
        restoreMenuCategory.fulfilled,
        (state, action) => {
          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category restored successfully"
            );
          }
        }
      )

      .addCase(
        restoreMenuCategory.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to restore category";

          toast.error(state.error);
        }
      );

    // ========================================================
    // HARD DELETE
    // ========================================================

    builder
      .addCase(
        hardDeleteMenuCategory.pending,
        (state) => {
          state.deleteLoading = true;
        }
      )

      .addCase(
        hardDeleteMenuCategory.fulfilled,
        (state, action) => {
          state.deleteLoading = false;

          if (action.payload.status) {
            toast.success(
              action.payload.message ||
                "Category permanently deleted"
            );
          }
        }
      )

      .addCase(
        hardDeleteMenuCategory.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.error =
            action.payload ||
            "Failed to permanently delete category";

          toast.error(state.error);
        }
      );
  },
});

export const {
  clearMenuCategoryError,
  clearSelectedMenuCategory,
  resetMenuCategories,
} = menuCategorySlice.actions;

export default menuCategorySlice.reducer;