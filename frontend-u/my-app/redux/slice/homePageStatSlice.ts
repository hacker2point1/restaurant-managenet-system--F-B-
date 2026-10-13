import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

export interface HomepageStats {
  averageRating: number | null;
  totalReviews: number;
  restaurantCount: number;
  happyDiners: number;
  paymentSuccessRate: number | null;
}

interface HomepageStatsResponse {
  success: boolean;
  message?: string;
  data: HomepageStats;
}

interface HomepageStatsState {
  data: HomepageStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: HomepageStatsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchHomepageStats = createAsyncThunk<
  HomepageStats,
  void,
  { rejectValue: string }
>("homepageStats/fetchHomepageStats", async (_, { rejectWithValue }) => {
  try {
    const response =
      await AxiosInstance.get<HomepageStatsResponse>(
        endpoints.public.homepageStats
      );

    if (!response.data.success || !response.data.data) {
      return rejectWithValue(
        response.data.message || "Unable to load homepage statistics."
      );
    }

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string }
        | undefined;

      return rejectWithValue(
        responseData?.message || error.message || "Request failed."
      );
    }

    return rejectWithValue("Something went wrong while loading statistics.");
  }
});

const homepageStatsSlice = createSlice({
  name: "homepageStats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomepageStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchHomepageStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load homepage statistics.";
      });
  },
});

export default homepageStatsSlice.reducer;