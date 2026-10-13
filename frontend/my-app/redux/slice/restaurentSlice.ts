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
  Restaurant,
  RestaurantsApiResponse,
  RestaurantApiResponse,
  RestaurantActionResponse,
} from "@/types/restaurent";

// ============================================================
// STATE
// ============================================================

interface RestaurantState {
  restaurants: Restaurant[];

  selectedRestaurant: Restaurant | null;

  loading: boolean;

  createLoading: boolean;

  getByIdLoading: boolean;

  updateLoading: boolean;

  deleteLoading: boolean;

  actionLoading: boolean;

  error: string | null;

  count: number;

  source: string | null;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: RestaurantState = {
  restaurants: [],

  selectedRestaurant: null,

  loading: false,

  createLoading: false,

  getByIdLoading: false,

  updateLoading: false,

  deleteLoading: false,

  actionLoading: false,

  error: null,

  count: 0,

  source: null,
};

// ============================================================
// GET ALL RESTAURANTS
// ============================================================

export const getRestaurants = createAsyncThunk<
  RestaurantsApiResponse,
  void,
  { rejectValue: string }
>(
  "restaurant/getRestaurants",

  async (_, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<RestaurantsApiResponse>(
          endpoints.restaurant.getAll
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch restaurants"
      );
    }
  }
);

// ============================================================
// GET RESTAURANT BY ID
// ============================================================

export const getRestaurantById = createAsyncThunk<
  RestaurantApiResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/getRestaurantById",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<RestaurantApiResponse>(
          endpoints.restaurant.getById(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch restaurant"
      );
    }
  }
);

// ============================================================
// CREATE RESTAURANT
// ============================================================

export const createRestaurant = createAsyncThunk<
  RestaurantApiResponse,
  FormData,
  { rejectValue: string }
>(
  "restaurant/createRestaurant",

  async (formData, thunkAPI) => {
    try {
      const response =
        await axiosInstance.post<RestaurantApiResponse>(
          endpoints.restaurant.create,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to create restaurant"
      );
    }
  }
);

// ============================================================
// UPDATE RESTAURANT
// ============================================================

export const updateRestaurant = createAsyncThunk<
  RestaurantApiResponse,
  {
    id: string;
    formData: FormData;
  },
  { rejectValue: string }
>(
  "restaurant/updateRestaurant",

  async ({ id, formData }, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<RestaurantApiResponse>(
          endpoints.restaurant.update(id),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to update restaurant"
      );
    }
  }
);

// ============================================================
// SOFT DELETE
// ============================================================

export const deleteRestaurant = createAsyncThunk<
  RestaurantActionResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/deleteRestaurant",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.delete<RestaurantActionResponse>(
          endpoints.restaurant.delete(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to delete restaurant"
      );
    }
  }
);

// ============================================================
// ACTIVATE
// ============================================================

export const activateRestaurant = createAsyncThunk<
  RestaurantActionResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/activateRestaurant",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<RestaurantActionResponse>(
          endpoints.restaurant.activate(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to activate restaurant"
      );
    }
  }
);

// ============================================================
// DEACTIVATE
// ============================================================

export const deactivateRestaurant = createAsyncThunk<
  RestaurantActionResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/deactivateRestaurant",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<RestaurantActionResponse>(
          endpoints.restaurant.deactivate(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to deactivate restaurant"
      );
    }
  }
);

// ============================================================
// RESTORE
// ============================================================

export const restoreRestaurant = createAsyncThunk<
  RestaurantActionResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/restoreRestaurant",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch<RestaurantActionResponse>(
          endpoints.restaurant.restore(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to restore restaurant"
      );
    }
  }
);

// ============================================================
// HARD DELETE
// ============================================================

export const hardDeleteRestaurant = createAsyncThunk<
  RestaurantActionResponse,
  string,
  { rejectValue: string }
>(
  "restaurant/hardDeleteRestaurant",

  async (id, thunkAPI) => {
    try {
      const response =
        await axiosInstance.delete<RestaurantActionResponse>(
          endpoints.restaurant.hardDelete(id)
        );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message ||
          "Failed to permanently delete restaurant"
      );
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const restaurantSlice = createSlice({
  name: "restaurant",

  initialState,

  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    },

    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },

    clearRestaurants: (state) => {
      state.restaurants = [];
      state.selectedRestaurant = null;
      state.count = 0;
      state.source = null;
    },
  },

  extraReducers: (builder) => {
    // ========================================================
    // GET ALL
    // ========================================================

    builder
      .addCase(
        getRestaurants.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getRestaurants.fulfilled,
        (state, { payload }) => {
          state.loading = false;

          if (payload.status) {
            state.restaurants =
              payload.data || [];

            state.count =
              payload.count ??
              payload.data?.length ??
              0;

            state.source =
              payload.source ?? null;
          }
        }
      )

      .addCase(
        getRestaurants.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch restaurants";

          toast.error(state.error);
        }
      );

    // ========================================================
    // GET BY ID
    // ========================================================

    builder
      .addCase(
        getRestaurantById.pending,
        (state) => {
          state.getByIdLoading = true;
          state.error = null;
        }
      )

      .addCase(
        getRestaurantById.fulfilled,
        (state, { payload }) => {
          state.getByIdLoading = false;

          if (payload.status) {
            state.selectedRestaurant =
              payload.data;
          }
        }
      )

      .addCase(
        getRestaurantById.rejected,
        (state, action) => {
          state.getByIdLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // CREATE
    // ========================================================

    builder
      .addCase(
        createRestaurant.pending,
        (state) => {
          state.createLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createRestaurant.fulfilled,
        (state, { payload }) => {
          state.createLoading = false;

          if (payload.status) {
            if (payload.data) {
              state.restaurants.unshift(
                payload.data
              );
            }

            state.count =
              payload.count ??
              state.restaurants.length;

            toast.success(
              payload.message ||
                "Restaurant created successfully"
            );
          }
        }
      )

      .addCase(
        createRestaurant.rejected,
        (state, action) => {
          state.createLoading = false;

          state.error =
            action.payload ||
            "Failed to create restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // UPDATE
    // ========================================================

    builder
      .addCase(
        updateRestaurant.pending,
        (state) => {
          state.updateLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateRestaurant.fulfilled,
        (state, { payload }) => {
          state.updateLoading = false;

          if (payload.status) {
            const updated =
              payload.data;

            if (updated) {
              const index =
                state.restaurants.findIndex(
                  (restaurant) =>
                    restaurant._id ===
                    updated._id
                );

              if (index !== -1) {
                state.restaurants[index] =
                  updated;
              }

              if (
                state.selectedRestaurant?._id ===
                updated._id
              ) {
                state.selectedRestaurant =
                  updated;
              }
            }

            toast.success(
              payload.message ||
                "Restaurant updated successfully"
            );
          }
        }
      )

      .addCase(
        updateRestaurant.rejected,
        (state, action) => {
          state.updateLoading = false;

          state.error =
            action.payload ||
            "Failed to update restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // SOFT DELETE
    // ========================================================

    builder
      .addCase(
        deleteRestaurant.pending,
        (state) => {
          state.deleteLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteRestaurant.fulfilled,
        (state, { payload }) => {
          state.deleteLoading = false;

          if (payload.status) {
            const deletedId =
              payload.data?._id;

            if (deletedId) {
              const restaurant =
                state.restaurants.find(
                  (item) =>
                    item._id === deletedId
                );

              if (restaurant) {
                restaurant.isDeleted = true;
                restaurant.isActive = false;

                restaurant.deletedAt =
                  payload.data?.deletedAt ??
                  new Date().toISOString();
              }

              if (
                state.selectedRestaurant?._id ===
                deletedId
              ) {
                state.selectedRestaurant = null;
              }
            }

            toast.success(
              payload.message ||
                "Restaurant deleted successfully"
            );
          }
        }
      )

      .addCase(
        deleteRestaurant.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.error =
            action.payload ||
            "Failed to delete restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // ACTIVATE
    // ========================================================

    builder
      .addCase(
        activateRestaurant.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        activateRestaurant.fulfilled,
        (state, { payload }) => {
          state.actionLoading = false;

          if (payload.status) {
            const id =
              payload.data?._id;

            const restaurant =
              state.restaurants.find(
                (item) =>
                  item._id === id
              );

            if (restaurant) {
              restaurant.isActive = true;
              restaurant.isDeleted = false;
            }

            if (
              state.selectedRestaurant?._id === id
            ) {
              state.selectedRestaurant.isActive =
                true;

              state.selectedRestaurant.isDeleted =
                false;
            }

            toast.success(
              payload.message ||
                "Restaurant activated successfully"
            );
          }
        }
      )

      .addCase(
        activateRestaurant.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to activate restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // DEACTIVATE
    // ========================================================

    builder
      .addCase(
        deactivateRestaurant.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deactivateRestaurant.fulfilled,
        (state, { payload }) => {
          state.actionLoading = false;

          if (payload.status) {
            const id =
              payload.data?._id;

            const restaurant =
              state.restaurants.find(
                (item) =>
                  item._id === id
              );

            if (restaurant) {
              restaurant.isActive = false;
            }

            if (
              state.selectedRestaurant?._id === id
            ) {
              state.selectedRestaurant.isActive =
                false;
            }

            toast.success(
              payload.message ||
                "Restaurant deactivated successfully"
            );
          }
        }
      )

      .addCase(
        deactivateRestaurant.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to deactivate restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // RESTORE
    // ========================================================

    builder
      .addCase(
        restoreRestaurant.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        restoreRestaurant.fulfilled,
        (state, { payload }) => {
          state.actionLoading = false;

          if (payload.status) {
            const id =
              payload.data?._id;

            const restaurant =
              state.restaurants.find(
                (item) =>
                  item._id === id
              );

            if (restaurant) {
              restaurant.isDeleted = false;
              restaurant.isActive = true;
              restaurant.deletedAt = null;
            }

            if (
              state.selectedRestaurant?._id === id
            ) {
              state.selectedRestaurant.isDeleted =
                false;

              state.selectedRestaurant.isActive =
                true;

              state.selectedRestaurant.deletedAt =
                null;
            }

            toast.success(
              payload.message ||
                "Restaurant restored successfully"
            );
          }
        }
      )

      .addCase(
        restoreRestaurant.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to restore restaurant";

          toast.error(state.error);
        }
      );

    // ========================================================
    // HARD DELETE
    // ========================================================

    builder
      .addCase(
        hardDeleteRestaurant.pending,
        (state) => {
          state.deleteLoading = true;
          state.error = null;
        }
      )

      .addCase(
        hardDeleteRestaurant.fulfilled,
        (state, { payload }) => {
          state.deleteLoading = false;

          if (payload.status) {
            const deletedId =
              payload.data?._id;

            if (deletedId) {
              state.restaurants =
                state.restaurants.filter(
                  (restaurant) =>
                    restaurant._id !==
                    deletedId
                );

              state.count =
                state.restaurants.length;

              if (
                state.selectedRestaurant?._id ===
                deletedId
              ) {
                state.selectedRestaurant = null;
              }
            }

            toast.success(
              payload.message ||
                "Restaurant permanently deleted"
            );
          }
        }
      )

      .addCase(
        hardDeleteRestaurant.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.error =
            action.payload ||
            "Failed to permanently delete restaurant";

          toast.error(state.error);
        }
      );
  },
});

// ============================================================
// ACTIONS
// ============================================================

export const {
  clearRestaurantError,
  clearSelectedRestaurant,
  clearRestaurants,
} = restaurantSlice.actions;

// ============================================================
// REDUCER
// ============================================================

export default restaurantSlice.reducer;