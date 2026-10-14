
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

export interface FeaturedCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  expiryDate: string;
  restaurant: {
    _id: string;
    name: string;
    image: string;
  };
}

interface CouponResponse {
  status: boolean;
  message?: string;
  data: FeaturedCoupon | null;
}

interface WeekendOfferState {
  coupon: FeaturedCoupon | null;
  loading: boolean;
  error: string | null;
}

const initialState: WeekendOfferState = {
  coupon: null,
  loading: false,
  error: null,
};

export const fetchFeaturedCoupon = createAsyncThunk<
  FeaturedCoupon | null,
  void,
  { rejectValue: string }
>(
  "weekendOffer/fetchFeaturedCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get<CouponResponse>(
        endpoints.coupon.getFeaturedPublic
      );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to load featured offer."
        );
      }

      return response.data.data;
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      return rejectWithValue(
        message || "Unable to load the featured offer."
      );
    }
  }
);

const weekendOfferSlice = createSlice({
  name: "weekendOffer",
  initialState,
  reducers: {
    clearWeekendOfferError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
      })
      .addCase(fetchFeaturedCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load the featured offer.";
      });
  },
});

export const { clearWeekendOfferError } = weekendOfferSlice.actions;

export default weekendOfferSlice.reducer;
