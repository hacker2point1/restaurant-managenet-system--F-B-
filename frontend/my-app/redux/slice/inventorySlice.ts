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
  InventoryItem,
  InventoryFormData,
  InventoryQuery,
  StockOperation,
  InventoryStats,
} from "@/types/inventory";

/* ============================================================
   RESPONSE TYPES
============================================================ */

interface InventoryListResponse {
  status: boolean;

  message: string;

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  data: InventoryItem[];

  stats?: InventoryStats;
}

interface InventoryResponse {
  status: boolean;

  message: string;

  data?: InventoryItem;
}

interface InventoryState {
  items: InventoryItem[];

  deletedItems: InventoryItem[];

  selectedItem: InventoryItem | null;

  stats: InventoryStats;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  deletedTotal: number;

  deletedPage: number;

  deletedTotalPages: number;

  loading: boolean;

  deletedLoading: boolean;

  actionLoading: boolean;

  error: string | null;
}

/* ============================================================
   INITIAL STATE
============================================================ */

const initialState: InventoryState = {
  items: [],

  deletedItems: [],

  selectedItem: null,

  stats: {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
  },

  total: 0,

  page: 1,

  limit: 10,

  totalPages: 0,

  deletedTotal: 0,

  deletedPage: 1,

  deletedTotalPages: 0,

  loading: false,

  deletedLoading: false,

  actionLoading: false,

  error: null,
};

/* ============================================================
   GET ACTIVE INVENTORY
============================================================ */

export const getInventoryItems =
  createAsyncThunk<
    InventoryListResponse,
    {
      branchId?: string;
      branchIds?: string[];
      query?: InventoryQuery;
    },
    { rejectValue: string }
  >(
    "inventory/getInventoryItems",

    async (
      {
        branchId,
        branchIds,
        query = {},
      },
      thunkAPI
    ) => {
      try {
        const requestedPage = query.page ?? 1;
        const requestedLimit = query.limit ?? 10;

        const createParams = (page: number, limit: number) => {
          const params = new URLSearchParams();
          params.set("page", String(page));
          params.set("limit", String(limit));

          if (query.search) params.set("search", query.search);
          if (query.isActive !== undefined) {
            params.set("isActive", String(query.isActive));
          }
          if (query.unit) params.set("unit", query.unit);

          return params.toString();
        };

        if (branchId) {
          const response = await axiosInstance.get<InventoryListResponse>(
            `${endpoints.inventory.getAll(branchId)}?${createParams(requestedPage, requestedLimit)}`
          );

          return response.data;
        }

        let allBranchIds = branchIds;

        if (!allBranchIds) {
          const restaurantsResponse = await axiosInstance.get<{
            data?: { _id: string }[];
          }>(endpoints.restaurant.getAll);
          const restaurants = restaurantsResponse.data?.data || [];
          const branchResponses = await Promise.all(
            restaurants.map((restaurant) =>
              axiosInstance.get<{
                data?: { _id: string }[];
              }>(endpoints.branch.getByRestaurantId(restaurant._id))
            )
          );
          allBranchIds = Array.from(new Set(
            branchResponses.flatMap((response) =>
              (response.data?.data || []).map((branch) => branch._id)
            )
          ));
        }

        if (allBranchIds.length === 0) {
          return {
            status: true,
            message: "No branches available",
            data: [],
            pagination: {
              total: 0,
              page: requestedPage,
              limit: requestedLimit,
              totalPages: 0,
            },
            stats: {
              total: 0,
              inStock: 0,
              lowStock: 0,
              outOfStock: 0,
              inventoryValue: 0,
            },
          };
        }

        const branchItems = await Promise.all(
          allBranchIds.map(async (id) => {
            const firstResponse = await axiosInstance.get<InventoryListResponse>(
              `${endpoints.inventory.getAll(id)}?${createParams(1, 100)}`
            );
            const firstPage = firstResponse.data;
            const remainingPages = await Promise.all(
              Array.from(
                { length: Math.max(0, firstPage.pagination.totalPages - 1) },
                (_, index) =>
                  axiosInstance.get<InventoryListResponse>(
                    `${endpoints.inventory.getAll(id)}?${createParams(index + 2, 100)}`
                  )
              )
            );

            return {
              items: [
                ...firstPage.data,
                ...remainingPages.flatMap((response) => response.data.data),
              ],
              stats: firstPage.stats,
            };
          })
        );

        const allItems = branchItems
          .flatMap((branch) => branch.items)
          .sort((first, second) =>
            Date.parse(second.createdAt) - Date.parse(first.createdAt)
          );
        const total = allItems.length;
        const stats = branchItems.reduce<InventoryStats>(
          (totalStats, branch) => ({
            total: totalStats.total + (branch.stats?.total || 0),
            inStock: totalStats.inStock + (branch.stats?.inStock || 0),
            lowStock: totalStats.lowStock + (branch.stats?.lowStock || 0),
            outOfStock: totalStats.outOfStock + (branch.stats?.outOfStock || 0),
            inventoryValue: totalStats.inventoryValue + (branch.stats?.inventoryValue || 0),
          }),
          {
            total: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            inventoryValue: 0,
          }
        );
        const startIndex = (requestedPage - 1) * requestedLimit;

        return {
          status: true,
          message: "Inventory fetched across all branches",
          data: allItems.slice(startIndex, startIndex + requestedLimit),
          pagination: {
            total,
            page: requestedPage,
            limit: requestedLimit,
            totalPages: Math.ceil(total / requestedLimit),
          },
          stats,
        };

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
            "Failed to fetch inventory"
        );
      }
    }
  );

/* ============================================================
   GET DELETED INVENTORY
============================================================ */

export const getDeletedInventoryItems =
  createAsyncThunk<
    InventoryListResponse,
    {
      branchId?: string;
      branchIds?: string[];
      query?: InventoryQuery;
    },
    { rejectValue: string }
  >(
    "inventory/getDeletedInventoryItems",

    async (
      {
        branchId,
        branchIds,
        query = {},
      },
      thunkAPI
    ) => {
      try {
        const requestedPage = query.page ?? 1;
        const requestedLimit = query.limit ?? 10;
        const createParams = (page: number, limit: number) => {
          const params = new URLSearchParams();
          params.set("page", String(page));
          params.set("limit", String(limit));
          if (query.search) params.set("search", query.search);
          if (query.unit) params.set("unit", query.unit);
          return params.toString();
        };

        if (branchId) {
          const response = await axiosInstance.get<InventoryListResponse>(
            `${endpoints.inventory.getDeleted(branchId)}?${createParams(requestedPage, requestedLimit)}`
          );
          return response.data;
        }

        let allBranchIds = branchIds;
        if (!allBranchIds) {
          const restaurantsResponse = await axiosInstance.get<{
            data?: { _id: string }[];
          }>(endpoints.restaurant.getAll);
          const restaurants = restaurantsResponse.data?.data || [];
          const branchResponses = await Promise.all(
            restaurants.map((restaurant) =>
              axiosInstance.get<{
                data?: { _id: string }[];
              }>(endpoints.branch.getByRestaurantId(restaurant._id))
            )
          );
          allBranchIds = Array.from(new Set(
            branchResponses.flatMap((response) =>
              (response.data?.data || []).map((branch) => branch._id)
            )
          ));
        }

        if (allBranchIds.length === 0) {
          return {
            status: true,
            message: "No branches available",
            data: [],
            pagination: {
              total: 0,
              page: requestedPage,
              limit: requestedLimit,
              totalPages: 0,
            },
          };
        }

        const branchResults = await Promise.all(
          allBranchIds.map(async (id) => {
            const firstResponse = await axiosInstance.get<InventoryListResponse>(
              `${endpoints.inventory.getDeleted(id)}?${createParams(1, 100)}`
            );
            const firstPage = firstResponse.data;
            const laterPages = await Promise.all(
              Array.from(
                { length: Math.max(0, firstPage.pagination.totalPages - 1) },
                (_, index) =>
                  axiosInstance.get<InventoryListResponse>(
                    `${endpoints.inventory.getDeleted(id)}?${createParams(index + 2, 100)}`
                  )
              )
            );
            return [
              ...firstPage.data,
              ...laterPages.flatMap((response) => response.data.data),
            ];
          })
        );

        const allItems = branchResults
          .flat()
          .sort((first, second) =>
            Date.parse(second.createdAt) - Date.parse(first.createdAt)
          );
        const total = allItems.length;
        const startIndex = (requestedPage - 1) * requestedLimit;

        return {
          status: true,
          message: "Deleted inventory fetched across all branches",
          data: allItems.slice(startIndex, startIndex + requestedLimit),
          pagination: {
            total,
            page: requestedPage,
            limit: requestedLimit,
            totalPages: Math.ceil(total / requestedLimit),
          },
        };

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
            "Failed to fetch deleted inventory"
        );
      }
    }
  );

/* ============================================================
   GET BY ID
============================================================ */

export const getInventoryItemById =
  createAsyncThunk<
    InventoryItem,
    string,
    { rejectValue: string }
  >(
    "inventory/getInventoryItemById",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.get<InventoryResponse>(
            endpoints.inventory.getById(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Inventory item not found"
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
            "Failed to fetch inventory item"
        );
      }
    }
  );

/* ============================================================
   CREATE
============================================================ */

export const createInventoryItem =
  createAsyncThunk<
    InventoryItem,
    {
      branchId: string;
      data: InventoryFormData;
    },
    { rejectValue: string }
  >(
    "inventory/createInventoryItem",

    async (
      {
        branchId,
        data,
      },
      thunkAPI
    ) => {
      try {
        const payload = {
          name: data.name,

          sku:
            data.sku ||
            undefined,

          unit: data.unit,

          currentQuantity:
            Number(
              data.currentQuantity || 0
            ),

          minimumStock:
            Number(
              data.minimumStock || 0
            ),

          maximumStock:
            data.maximumStock
              ? Number(
                  data.maximumStock
                )
              : undefined,

          unitCost:
            Number(
              data.unitCost || 0
            ),

          supplier: {
            name:
              data.supplierName ||
              undefined,

            phone:
              data.supplierPhone ||
              undefined,

            email:
              data.supplierEmail ||
              undefined,
          },

          expiryDate:
            data.expiryDate ||
            undefined,

          isActive:
            data.isActive,
        };

        const response =
          await axiosInstance.post<InventoryResponse>(
            endpoints.inventory.create(
              branchId
            ),
            payload
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Failed to create inventory item"
          );
        }

        toast.success(
          response.data.message ||
            "Inventory item created successfully"
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
            "Failed to create inventory item"
        );
      }
    }
  );

/* ============================================================
   UPDATE
============================================================ */

export const updateInventoryItem =
  createAsyncThunk<
    InventoryItem,
    {
      id: string;
      data: InventoryFormData;
    },
    { rejectValue: string }
  >(
    "inventory/updateInventoryItem",

    async (
      {
        id,
        data,
      },
      thunkAPI
    ) => {
      try {
        const payload = {
          name: data.name,

          sku:
            data.sku ||
            undefined,

          unit: data.unit,

          minimumStock:
            Number(
              data.minimumStock || 0
            ),

          maximumStock:
            data.maximumStock
              ? Number(
                  data.maximumStock
                )
              : undefined,

          unitCost:
            Number(
              data.unitCost || 0
            ),

          supplier: {
            name:
              data.supplierName ||
              undefined,

            phone:
              data.supplierPhone ||
              undefined,

            email:
              data.supplierEmail ||
              undefined,
          },

          expiryDate:
            data.expiryDate ||
            undefined,

          isActive:
            data.isActive,
        };

        const response =
          await axiosInstance.patch<InventoryResponse>(
            endpoints.inventory.update(
              id
            ),
            payload
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Failed to update inventory item"
          );
        }

        toast.success(
          response.data.message ||
            "Inventory item updated successfully"
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
            "Failed to update inventory item"
        );
      }
    }
  );

/* ============================================================
   SOFT DELETE
============================================================ */

export const softDeleteInventoryItem =
  createAsyncThunk<
    InventoryItem,
    string,
    { rejectValue: string }
  >(
    "inventory/softDeleteInventoryItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<InventoryResponse>(
            endpoints.inventory.softDelete(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Delete failed"
          );
        }

        toast.success(
          response.data.message ||
            "Inventory item deleted"
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
            "Failed to delete inventory item"
        );
      }
    }
  );

/* ============================================================
   RESTORE
============================================================ */

export const restoreInventoryItem =
  createAsyncThunk<
    InventoryItem,
    string,
    { rejectValue: string }
  >(
    "inventory/restoreInventoryItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch<InventoryResponse>(
            endpoints.inventory.restore(
              id
            )
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Restore failed"
          );
        }

        toast.success(
          response.data.message ||
            "Inventory item restored successfully"
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
            "Failed to restore inventory item"
        );
      }
    }
  );

/* ============================================================
   HARD DELETE
============================================================ */

export const hardDeleteInventoryItem =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "inventory/hardDeleteInventoryItem",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.delete<{
            status: boolean;
            message: string;
          }>(
            endpoints.inventory.hardDelete(
              id
            )
          );

        toast.success(
          response.data.message ||
            "Inventory item permanently deleted"
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
            "Failed to permanently delete inventory item"
        );
      }
    }
  );

/* ============================================================
   UPDATE STOCK
============================================================ */

export const updateInventoryStock =
  createAsyncThunk<
    InventoryItem,
    {
      id: string;

      quantity: number;

      operation: StockOperation;
    },
    { rejectValue: string }
  >(
    "inventory/updateInventoryStock",

    async (
      {
        id,
        quantity,
        operation,
      },
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.patch<InventoryResponse>(
            endpoints.inventory.updateStock(
              id
            ),
            {
              quantity,
              operation,
            }
          );

        if (
          !response.data.data
        ) {
          return thunkAPI.rejectWithValue(
            "Stock update failed"
          );
        }

        toast.success(
          response.data.message ||
            "Stock updated successfully"
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
            "Failed to update stock"
        );
      }
    }
  );

/* ============================================================
   SLICE
============================================================ */

const inventorySlice =
  createSlice({
    name: "inventory",

    initialState,

    reducers: {
      clearInventoryError: (
        state
      ) => {
        state.error = null;
      },

      clearSelectedInventoryItem: (
        state
      ) => {
        state.selectedItem =
          null;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        /* ====================================================
           GET ACTIVE
        ==================================================== */

        .addCase(
          getInventoryItems.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          getInventoryItems.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.loading =
              false;

            state.items =
              payload.data || [];

            state.total =
              payload.pagination
                ?.total || 0;

            state.page =
              payload.pagination
                ?.page || 1;

            state.limit =
              payload.pagination
                ?.limit || 10;

            state.totalPages =
              payload.pagination
                ?.totalPages || 0;

            /*
              Calculate statistics from
              loaded items.

              If you later add a dedicated
              stats API, replace this
              calculation with backend stats.
            */

            if (payload.stats) {
              state.stats = payload.stats;
            }
          }
        )

        .addCase(
          getInventoryItems.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch inventory";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           GET DELETED
        ==================================================== */

        .addCase(
          getDeletedInventoryItems.pending,
          (state) => {
            state.deletedLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          getDeletedInventoryItems.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.deletedLoading =
              false;

            state.deletedItems =
              payload.data || [];

            state.deletedTotal =
              payload.pagination
                ?.total || 0;

            state.deletedPage =
              payload.pagination
                ?.page || 1;

            state.deletedTotalPages =
              payload.pagination
                ?.totalPages || 0;
          }
        )

        .addCase(
          getDeletedInventoryItems.rejected,
          (
            state,
            action
          ) => {
            state.deletedLoading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch deleted inventory";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           GET BY ID
        ==================================================== */

        .addCase(
          getInventoryItemById.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.selectedItem =
              payload;
          }
        )

        /* ====================================================
           CREATE
        ==================================================== */

        .addCase(
          createInventoryItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          createInventoryItem.fulfilled,
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
          createInventoryItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to create inventory item";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           UPDATE
        ==================================================== */

        .addCase(
          updateInventoryItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          updateInventoryItem.fulfilled,
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

            if (
              index !== -1
            ) {
              state.items[index] =
                payload;
            }

            state.selectedItem =
              payload;
          }
        )

        .addCase(
          updateInventoryItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update inventory item";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           SOFT DELETE
        ==================================================== */

        .addCase(
          softDeleteInventoryItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          softDeleteInventoryItem.fulfilled,
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
                  payload._id
              );

            state.total =
              Math.max(
                0,
                state.total - 1
              );
          }
        )

        .addCase(
          softDeleteInventoryItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to delete inventory item";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           RESTORE
        ==================================================== */

        .addCase(
          restoreInventoryItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          restoreInventoryItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            state.deletedItems =
              state.deletedItems.filter(
                (item) =>
                  item._id !==
                  payload._id
              );

            state.deletedTotal =
              Math.max(
                0,
                state.deletedTotal - 1
              );

            state.items.unshift(
              payload
            );

            state.total += 1;
          }
        )

        .addCase(
          restoreInventoryItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to restore inventory item";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           HARD DELETE
        ==================================================== */

        .addCase(
          hardDeleteInventoryItem.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          hardDeleteInventoryItem.fulfilled,
          (
            state,
            { payload }
          ) => {
            state.actionLoading =
              false;

            state.deletedItems =
              state.deletedItems.filter(
                (item) =>
                  item._id !==
                  payload
              );

            state.deletedTotal =
              Math.max(
                0,
                state.deletedTotal - 1
              );
          }
        )

        .addCase(
          hardDeleteInventoryItem.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to permanently delete inventory item";

            toast.error(
              state.error
            );
          }
        )

        /* ====================================================
           UPDATE STOCK
        ==================================================== */

        .addCase(
          updateInventoryStock.pending,
          (state) => {
            state.actionLoading =
              true;
          }
        )

        .addCase(
          updateInventoryStock.fulfilled,
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

            if (
              index !== -1
            ) {
              state.items[index] =
                payload;
            }
          }
        )

        .addCase(
          updateInventoryStock.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update stock";

            toast.error(
              state.error
            );
          }
        );
    },
  });

export const {
  clearInventoryError,
  clearSelectedInventoryItem,
} =
  inventorySlice.actions;

export default inventorySlice.reducer;