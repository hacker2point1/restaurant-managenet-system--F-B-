import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


import { endpoints } from "@/api/endpoints/endpoints";
import AxiosInstance from "@/api/axios/axios";

export interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string | { url?: string; publicId?: string } | null;
  menuItemCount?: number;
  isActive: boolean;
  displayOrder?: number;
}

export interface CategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MenuCategoryResponse {
  status: boolean;
  message: string;
  data: MenuCategory[];
  pagination: CategoryPagination;
}

interface FetchCategoriesArgs {
  branchId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface FetchCategoriesResult {
  categories: MenuCategory[];
  pagination: CategoryPagination;
}

interface MenuCategoryState {
  categories: MenuCategory[];
  pagination: CategoryPagination;
  loading: boolean;
  error: string | null;
}

const initialState: MenuCategoryState = {
  categories: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const fetchMenuCategories = createAsyncThunk<
  FetchCategoriesResult,
  FetchCategoriesArgs,
  { rejectValue: string }
>(
  "menuCategories/fetchMenuCategories",
  async (
    { branchId, page = 1, limit = 12, search = "" },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await AxiosInstance.get<MenuCategoryResponse>(
          branchId
            ? endpoints.menuCategory.getByBranch(branchId)
            : endpoints.menuCategory.getPublic,
          {
            params: {
              page,
              limit,
              search: search.trim(),
              isActive: true,
            },
          }
        );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch categories."
        );
      }

      return {
        categories: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string }
          | undefined;

        return rejectWithValue(
          responseData?.message ||
            error.message ||
            "Failed to fetch menu categories."
        );
      }

      return rejectWithValue("Something went wrong.");
    }
  }
);

const menuCategorySlice = createSlice({
  name: "menuCategories",
  initialState,
  reducers: {
    clearMenuCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch menu categories.";
      });
  },
});

export const { clearMenuCategoryError } = menuCategorySlice.actions;

export default menuCategorySlice.reducer;