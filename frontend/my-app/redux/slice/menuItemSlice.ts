"use client";

import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";

import axiosInstance from "@/api/axios/axios";

import { toast } from "sonner";

import { endpoints } from "@/api/endpoints/endpoints";

import type {
  MenuItem,
  MenuItemFormData,
  MenuItemQuery,
} from "@/types/menuItem";

/* ============================================================
   TYPES
============================================================ */

interface MenuItemResponse {
  status: boolean;
  message: string;

  data?: MenuItem;

  total?: number;

  page?: number;

  limit?: number;

  totalPages?: number;
}

interface MenuItemsResponse {
  status: boolean;

  message?: string;

  data: MenuItem[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

interface MenuItemState {
  items: MenuItem[];

  selectedItem: MenuItem | null;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  loading: boolean;

  actionLoading: boolean;

  error: string | null;
}

/* ============================================================
   INITIAL STATE
============================================================ */

const initialState: MenuItemState = {
  items: [],

  selectedItem: null,

  total: 0,

  page: 1,

  limit: 10,

  totalPages: 0,

  loading: false,

  actionLoading: false,

  error: null,
};

/* ============================================================
   GET ALL MENU ITEMS
============================================================ */

/*
  All branches:

  GET /api/v1/menuItems/menu-items

  Specific branch:

  GET /api/v1/menuItems/menu-items?branchId=XXXX
*/

export const getMenuItems = createAsyncThunk<
  MenuItemsResponse,
  MenuItemQuery | undefined,
  { rejectValue: string }
>(
  "menuItems/getMenuItems",

  async (params = {}, thunkAPI) => {
    try {
      const queryParams =
        new URLSearchParams();

      queryParams.set(
        "page",
        String(params.page ?? 1)
      );

      queryParams.set(
        "limit",
        String(params.limit ?? 10)
      );

      /*
        Only send branchId when a branch
        is actually selected.

        If branchId is undefined:
        → All branches
      */

      if (params.branchId) {
        queryParams.set(
          "branchId",
          params.branchId
        );
      }

      if (params.category) {
        queryParams.set(
          "category",
          params.category
        );
      }

      if (params.foodType) {
        queryParams.set(
          "foodType",
          params.foodType
        );
      }

      if (
        params.isAvailable !==
        undefined
      ) {
        queryParams.set(
          "isAvailable",
          String(params.isAvailable)
        );
      }

      if (
        params.isFeatured !==
        undefined
      ) {
        queryParams.set(
          "isFeatured",
          String(params.isFeatured)
        );
      }

      const response =
        await axiosInstance.get<MenuItemsResponse>(
          `${endpoints.menuItems.getAll}?${queryParams.toString()}`
        );

      return response.data;

    } catch (error: unknown) {
      const message =
        axios.isAxiosError<{
          message?: string;
        }>(error)
          ? error.response?.data?.message
          : undefined;

      return thunkAPI.rejectWithValue(
        message ||
          "Failed to fetch menu items"
      );
    }
  }
);

/* ============================================================
   SEARCH MENU ITEMS
============================================================ */

export const searchMenuItems = createAsyncThunk<
  MenuItemsResponse,
  {
    search: string;

    branchId?: string;

    page?: number;

    limit?: number;
  },
  { rejectValue: string }
>(
  "menuItems/searchMenuItems",

  async (
    {
      search,
      branchId,
      page = 1,
      limit = 10,
    },
    thunkAPI
  ) => {
    try {
      const queryParams =
        new URLSearchParams();

      queryParams.set(
        "search",
        search
      );

      queryParams.set(
        "page",
        String(page)
      );

      queryParams.set(
        "limit",
        String(limit)
      );

      /*
        Optional branch filter.
      */

      if (branchId) {
        queryParams.set(
          "branchId",
          branchId
        );
      }

      const response =
        await axiosInstance.get<MenuItemsResponse>(
          `${endpoints.menuItems.search}?${queryParams.toString()}`
        );

      return response.data;

    } catch (error: unknown) {
      const message =
        axios.isAxiosError<{
          message?: string;
        }>(error)
          ? error.response?.data?.message
          : undefined;

      return thunkAPI.rejectWithValue(
        message ||
          "Failed to search menu items"
      );
    }
  }
);

/* ============================================================
   GET MENU ITEM BY ID
============================================================ */

export const getMenuItemById =
  createAsyncThunk<
    MenuItem,
    string,
    { rejectValue: string }
  >(
    "menuItems/getMenuItemById",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.get<MenuItemResponse>(
            endpoints.menuItems.getById(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Menu item not found"
          );
        }

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to fetch menu item"
        );
      }
    }
  );

/* ============================================================
   CREATE MENU ITEM
============================================================ */

export const createMenuItem =
  createAsyncThunk<
    MenuItem,
    {
      branchId: string;

      data: MenuItemFormData;
    },
    { rejectValue: string }
  >(
    "menuItems/createMenuItem",

    async (
      { branchId, data },
      thunkAPI
    ) => {
      try {
        const formData =
          new FormData();

        /* --------------------------------
           BASIC FIELDS
        -------------------------------- */

        formData.append(
          "name",
          data.name
        );

        formData.append(
          "description",
          data.description
        );

        formData.append(
          "price",
          data.price
        );

        formData.append(
          "category",
          data.category
        );

        formData.append(
          "foodType",
          data.foodType
        );

        formData.append(
          "preparationTime",
          data.preparationTime
        );

        /* --------------------------------
           ARRAY FIELDS

           Backend expects JSON arrays.
        -------------------------------- */

        formData.append(
          "ingredients",
          JSON.stringify(
            data.ingredients
          )
        );

        formData.append(
          "tags",
          JSON.stringify(
            data.tags
          )
        );

        /* --------------------------------
           BOOLEAN FIELDS
        -------------------------------- */

        formData.append(
          "isAvailable",
          String(
            data.isAvailable
          )
        );

        formData.append(
          "isFeatured",
          String(
            data.isFeatured
          )
        );

        /* --------------------------------
           IMAGES
        -------------------------------- */

        data.images.forEach(
          (image) => {
            formData.append(
              "images",
              image
            );
          }
        );

        const response =
          await axiosInstance.post<MenuItemResponse>(
            endpoints.menuItems.create(
              branchId
            ),
            formData
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Menu item creation failed"
          );
        }

        toast.success(
          response.data.message ||
            "Menu item created successfully"
        );

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to create menu item"
        );
      }
    }
  );

/* ============================================================
   UPDATE MENU ITEM
============================================================ */

export const updateMenuItem =
  createAsyncThunk<
    MenuItem,
    {
      id: string;

      data: MenuItemFormData;
    },
    { rejectValue: string }
  >(
    "menuItems/updateMenuItem",

    async (
      { id, data },
      thunkAPI
    ) => {
      try {
        const formData =
          new FormData();

        /* --------------------------------
           BASIC FIELDS
        -------------------------------- */

        formData.append(
          "name",
          data.name
        );

        formData.append(
          "description",
          data.description
        );

        formData.append(
          "price",
          data.price
        );

        formData.append(
          "category",
          data.category
        );

        formData.append(
          "foodType",
          data.foodType
        );

        formData.append(
          "preparationTime",
          data.preparationTime
        );

        /* --------------------------------
           ARRAYS
        -------------------------------- */

        formData.append(
          "ingredients",
          JSON.stringify(
            data.ingredients
          )
        );

        formData.append(
          "tags",
          JSON.stringify(
            data.tags
          )
        );

        /* --------------------------------
           BOOLEANS
        -------------------------------- */

        formData.append(
          "isAvailable",
          String(
            data.isAvailable
          )
        );

        formData.append(
          "isFeatured",
          String(
            data.isFeatured
          )
        );

        /* --------------------------------
           NEW IMAGES
        -------------------------------- */

        data.images.forEach(
          (image) => {
            formData.append(
              "images",
              image
            );
          }
        );

        const response =
          await axiosInstance.patch<MenuItemResponse>(
            endpoints.menuItems.update(
              id
            ),
            formData
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Menu item update failed"
          );
        }

        toast.success(
          response.data.message ||
            "Menu item updated successfully"
        );

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to update menu item"
        );
      }
    }
  );

/* ============================================================
   SOFT DELETE MENU ITEM
============================================================ */

export const deleteMenuItem =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "menuItems/deleteMenuItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<MenuItemResponse>(
            endpoints.menuItems.softDelete(
              id
            )
          );

        toast.success(
          response.data.message ||
            "Menu item deleted successfully"
        );

        return id;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to delete menu item"
        );
      }
    }
  );

/* ============================================================
   RESTORE MENU ITEM
============================================================ */

export const restoreMenuItem =
  createAsyncThunk<
    MenuItem,
    string,
    { rejectValue: string }
  >(
    "menuItems/restoreMenuItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<MenuItemResponse>(
            endpoints.menuItems.restore(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Menu item restoration failed"
          );
        }

        toast.success(
          response.data.message ||
            "Menu item restored successfully"
        );

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to restore menu item"
        );
      }
    }
  );

/* ============================================================
   HARD DELETE MENU ITEM
============================================================ */

export const hardDeleteMenuItem =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "menuItems/hardDeleteMenuItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.delete<MenuItemResponse>(
            endpoints.menuItems.hardDelete(
              id
            )
          );

        toast.success(
          response.data.message ||
            "Menu item permanently deleted"
        );

        return id;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to permanently delete menu item"
        );
      }
    }
  );

/* ============================================================
   TOGGLE AVAILABILITY
============================================================ */

export const toggleMenuItemAvailability =
  createAsyncThunk<
    MenuItem,
    string,
    { rejectValue: string }
  >(
    "menuItems/toggleMenuItemAvailability",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<MenuItemResponse>(
            endpoints.menuItems.toggleAvailability(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Availability update failed"
          );
        }

        toast.success(
          response.data.message ||
            "Availability updated successfully"
        );

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to update availability"
        );
      }
    }
  );

/* ============================================================
   TOGGLE FEATURED
============================================================ */

export const toggleMenuItemFeatured =
  createAsyncThunk<
    MenuItem,
    string,
    { rejectValue: string }
  >(
    "menuItems/toggleMenuItemFeatured",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<MenuItemResponse>(
            endpoints.menuItems.toggleFeatured(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Featured status update failed"
          );
        }

        toast.success(
          response.data.message ||
            "Featured status updated successfully"
        );

        return response.data.data;

      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data
                ?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to update featured status"
        );
      }
    }
  );

/* ============================================================
   SLICE
============================================================ */

const menuItemSlice =
  createSlice({
    name: "menuItemSlice",

    initialState,

    reducers: {
      clearSelectedMenuItem: (
        state
      ) => {
        state.selectedItem =
          null;
      },

      clearMenuItemError: (
        state
      ) => {
        state.error = null;
      },

      clearMenuItems: (state) => {
        state.items = [];

        state.total = 0;

        state.page = 1;

        state.totalPages = 0;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        /* =====================================================
           GET ALL
        ===================================================== */

        .addCase(
          getMenuItems.pending,
          (state) => {
            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          getMenuItems.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.loading =
              false;

            state.items =
              payload.data || [];

            state.total =
              payload.total || 0;

            state.page =
              payload.page || 1;

            state.limit =
              payload.limit || 10;

            state.totalPages =
              payload.totalPages ||
              0;
          }
        )

        .addCase(
          getMenuItems.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch menu items";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           SEARCH
        ===================================================== */

        .addCase(
          searchMenuItems.pending,
          (state) => {
            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          searchMenuItems.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.loading =
              false;

            state.items =
              payload.data || [];

            state.total =
              payload.total || 0;

            state.page =
              payload.page || 1;

            state.limit =
              payload.limit || 10;

            state.totalPages =
              payload.totalPages ||
              0;
          }
        )

        .addCase(
          searchMenuItems.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Search failed";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           GET BY ID
        ===================================================== */

        .addCase(
          getMenuItemById.pending,
          (state) => {
            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          getMenuItemById.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.loading =
              false;

            state.selectedItem =
              payload;
          }
        )

        .addCase(
          getMenuItemById.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           CREATE
        ===================================================== */

        .addCase(
          createMenuItem.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          createMenuItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            /*
              Add new item at beginning.
            */

            state.items.unshift(
              payload
            );

            state.total += 1;
          }
        )

        .addCase(
          createMenuItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to create menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           UPDATE
        ===================================================== */

        .addCase(
          updateMenuItem.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          updateMenuItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            const index =
              state.items.findIndex(
                (item) =>
                  item._id ===
                  payload._id
              );

            if (index !== -1) {
              state.items[index] =
                payload;
            }

            state.selectedItem =
              payload;
          }
        )

        .addCase(
          updateMenuItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           SOFT DELETE
        ===================================================== */

        .addCase(
          deleteMenuItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          deleteMenuItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            state.items =
              state.items.filter(
                (item) =>
                  item._id !==
                  payload
              );

            state.total =
              Math.max(
                0,
                state.total - 1
              );
          }
        )

        .addCase(
          deleteMenuItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to delete menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           RESTORE
        ===================================================== */

        .addCase(
          restoreMenuItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          restoreMenuItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            state.items.unshift(
              payload
            );

            state.total += 1;
          }
        )

        .addCase(
          restoreMenuItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to restore menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           HARD DELETE
        ===================================================== */

        .addCase(
          hardDeleteMenuItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          hardDeleteMenuItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            state.items =
              state.items.filter(
                (item) =>
                  item._id !==
                  payload
              );

            state.total =
              Math.max(
                0,
                state.total - 1
              );
          }
        )

        .addCase(
          hardDeleteMenuItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to permanently delete menu item";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           AVAILABILITY
        ===================================================== */

        .addCase(
          toggleMenuItemAvailability.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          toggleMenuItemAvailability.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            const index =
              state.items.findIndex(
                (item) =>
                  item._id ===
                  payload._id
              );

            if (index !== -1) {
              state.items[index] =
                payload;
            }

            if (
              state.selectedItem?._id ===
              payload._id
            ) {
              state.selectedItem =
                payload;
            }
          }
        )

        .addCase(
          toggleMenuItemAvailability.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update availability";

            toast.error(
              state.error
            );
          }
        )

        /* =====================================================
           FEATURED
        ===================================================== */

        .addCase(
          toggleMenuItemFeatured.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          toggleMenuItemFeatured.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            const index =
              state.items.findIndex(
                (item) =>
                  item._id ===
                  payload._id
              );

            if (index !== -1) {
              state.items[index] =
                payload;
            }

            if (
              state.selectedItem?._id ===
              payload._id
            ) {
              state.selectedItem =
                payload;
            }
          }
        )

        .addCase(
          toggleMenuItemFeatured.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update featured status";

            toast.error(
              state.error
            );
          }
        );
    },
  });

/* ============================================================
   EXPORTS
============================================================ */

export const {
  clearSelectedMenuItem,
  clearMenuItemError,
  clearMenuItems,
} = menuItemSlice.actions;

export default menuItemSlice.reducer;