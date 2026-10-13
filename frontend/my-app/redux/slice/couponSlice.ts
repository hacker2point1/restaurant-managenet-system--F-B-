import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";




import type {
  Coupon,
  CouponFormData,
  CouponPagination,
  CouponQuery,
} from "@/types/coupon";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

interface CouponState {
  coupons: Coupon[];

  selectedCoupon: Coupon | null;

  pagination: CouponPagination | null;

  loading: boolean;

  detailsLoading: boolean;

  actionLoading: boolean;

  error: string | null;

  deletedMode: boolean;
}

const initialState: CouponState = {
  coupons: [],

  selectedCoupon: null,

  pagination: null,

  loading: false,

  detailsLoading: false,

  actionLoading: false,

  error: null,

  deletedMode: false,
};

// ============================================================
// GET COUPONS
// ============================================================

export const getCoupons = createAsyncThunk(
  "coupon/getCoupons",

  async (
    query: CouponQuery = {},
    { rejectWithValue }
  ) => {
    try {
      const response =
        await AxiosInstance.get(
          endpoints.coupon.getAll,
          {
            params: query,
          }
        );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch coupons"
      );
    }
  }
);

// ============================================================
// GET DELETED COUPONS
// ============================================================

export const getDeletedCoupons =
  createAsyncThunk(
    "coupon/getDeletedCoupons",

    async (
      query: CouponQuery = {},
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.get(
            endpoints.coupon.getDeleted,
            {
              params: query,
            }
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to fetch deleted coupons"
        );
      }
    }
  );

// ============================================================
// GET BY ID
// ============================================================

export const getCouponById =
  createAsyncThunk(
    "coupon/getById",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.get(
            endpoints.coupon.getById(id)
          );

        return response.data.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to fetch coupon"
        );
      }
    }
  );

// ============================================================
// CREATE
// ============================================================

export const createCoupon =
  createAsyncThunk(
    "coupon/create",

    async (
      data: Record<string, any>,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.post(
            endpoints.coupon.create,
            data
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to create coupon"
        );
      }
    }
  );

// ============================================================
// UPDATE
// ============================================================

export const updateCoupon =
  createAsyncThunk(
    "coupon/update",

    async (
      {
        id,
        data,
      }: {
        id: string;
        data: Record<string, any>;
      },
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.patch(
            endpoints.coupon.update(id),
            data
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to update coupon"
        );
      }
    }
  );

// ============================================================
// ACTIVATE
// ============================================================

export const activateCoupon =
  createAsyncThunk(
    "coupon/activate",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.patch(
            endpoints.coupon.activate(id)
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to activate coupon"
        );
      }
    }
  );

// ============================================================
// DEACTIVATE
// ============================================================

export const deactivateCoupon =
  createAsyncThunk(
    "coupon/deactivate",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.patch(
            endpoints.coupon.deactivate(id)
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to deactivate coupon"
        );
      }
    }
  );

// ============================================================
// SOFT DELETE
// ============================================================

export const deleteCoupon =
  createAsyncThunk(
    "coupon/delete",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.delete(
            endpoints.coupon.delete(id)
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to delete coupon"
        );
      }
    }
  );

// ============================================================
// RESTORE
// ============================================================

export const restoreCoupon =
  createAsyncThunk(
    "coupon/restore",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.patch(
            endpoints.coupon.restore(id)
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to restore coupon"
        );
      }
    }
  );

// ============================================================
// PERMANENT DELETE
// ============================================================

export const permanentlyDeleteCoupon =
  createAsyncThunk(
    "coupon/permanentDelete",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await AxiosInstance.delete(
            endpoints.coupon.permanentDelete(id)
          );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to permanently delete coupon"
        );
      }
    }
  );

// ============================================================
// SLICE
// ============================================================

const couponSlice = createSlice({
  name: "coupon",

  initialState,

  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },

    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null;
    },

    setDeletedMode: (
      state,
      action
    ) => {
      state.deletedMode =
        action.payload;

      state.coupons = [];
      state.pagination = null;
    },
  },

  extraReducers: (builder) => {
    // ----------------------------------------------------------
    // GET ACTIVE
    // ----------------------------------------------------------

    builder
      .addCase(
        getCoupons.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getCoupons.fulfilled,
        (state, action) => {
          state.loading = false;

          state.coupons =
            action.payload.data || [];

          state.pagination =
            action.payload.pagination ||
            null;

          state.deletedMode = false;
        }
      )

      .addCase(
        getCoupons.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch coupons";
        }
      );

    // ----------------------------------------------------------
    // GET DELETED
    // ----------------------------------------------------------

    builder
      .addCase(
        getDeletedCoupons.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getDeletedCoupons.fulfilled,
        (state, action) => {
          state.loading = false;

          state.coupons =
            action.payload.data || [];

          state.pagination =
            action.payload.pagination ||
            null;

          state.deletedMode = true;
        }
      )

      .addCase(
        getDeletedCoupons.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch deleted coupons";
        }
      );

    // ----------------------------------------------------------
    // GET BY ID
    // ----------------------------------------------------------

    builder
      .addCase(
        getCouponById.pending,
        (state) => {
          state.detailsLoading = true;
        }
      )

      .addCase(
        getCouponById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;

          state.selectedCoupon =
            action.payload;
        }
      )

      .addCase(
        getCouponById.rejected,
        (state, action) => {
          state.detailsLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch coupon";
        }
      );

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    builder
      .addCase(
        createCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        createCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        createCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to create coupon";
        }
      );

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    builder
      .addCase(
        updateCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        updateCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        updateCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to update coupon";
        }
      );

    // ----------------------------------------------------------
    // ACTIVATE
    // ----------------------------------------------------------

    builder
      .addCase(
        activateCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        activateCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        activateCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to activate coupon";
        }
      );

    // ----------------------------------------------------------
    // DEACTIVATE
    // ----------------------------------------------------------

    builder
      .addCase(
        deactivateCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        deactivateCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        deactivateCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to deactivate coupon";
        }
      );

    // ----------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------

    builder
      .addCase(
        deleteCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        deleteCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        deleteCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to delete coupon";
        }
      );

    // ----------------------------------------------------------
    // RESTORE
    // ----------------------------------------------------------

    builder
      .addCase(
        restoreCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        restoreCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        restoreCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to restore coupon";
        }
      );

    // ----------------------------------------------------------
    // PERMANENT DELETE
    // ----------------------------------------------------------

    builder
      .addCase(
        permanentlyDeleteCoupon.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        permanentlyDeleteCoupon.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        permanentlyDeleteCoupon.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to permanently delete coupon";
        }
      );
  },
});

export const {
  clearCouponError,
  clearSelectedCoupon,
  setDeletedMode,
} = couponSlice.actions;

export default couponSlice.reducer;